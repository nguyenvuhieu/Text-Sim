from flask import Flask, request, jsonify
import nltk.tokenize
from sentence_transformers import SentenceTransformer, util
import tensorflow as tf
import numpy as np
import nltk
import torch
import ssl
import heapq
from flask_cors import CORS

def average_tensors(data):
    # Get the dimensions of the first tensor
    first_tensor = data[0]
    dimensions = first_tensor.size()

    # Check if all tensors have the same dimensions
    for tensor in data[1:]:
        if tensor.size() != dimensions:
            raise ValueError("All tensors in the list must have the same dimensions.")

    # Calculate element-wise sum (using loop)
    average = torch.zeros(dimensions, device=first_tensor.device)
    for tensor in data:
        average += tensor

    # Divide by the number of tensors
    average /= len(data)

    return average

app = Flask(__name__)

CORS(app)
dictModel = dict()
@app.route('/load-model', methods=['POST'])  # This route only accepts POST requests
def load_model():
    data = request.get_json()

    if data is None:
        return jsonify({'error': 'Invalid JSON format'}), 400  # Bad request
    modelName = data['model_name']
    if modelName in dictModel:
        return jsonify({'error': ''})
    try:
        model = SentenceTransformer(modelName)
    except TypeError:
        return jsonify({'error': 'Model not found'})
    dictModel[modelName] = model
    return jsonify({'error': ''})

class Pair:
    def __init__(self, data, score):
        self.data = data
        self.score = score

    # Define less-than comparison for max-heap (higher priority comes first)
    def __lt__(self, other):
        return self.score > other.score
  
@app.route('/compare/one-one', methods=['POST'])  # This route only accepts POST requests
def score_two_sentences():
    data = request.get_json()
    if data is None:
        return jsonify({'error': 'Invalid JSON format'}), 400  # Bad request
    load_model()
    modelName = data['model_name']
    if modelName not in dictModel:
        return jsonify({'error': 'Model not load'})

    model = dictModel[modelName]
    sentences1 = nltk.tokenize.sent_tokenize(data['first'])
    sentences2 = nltk.tokenize.sent_tokenize(data['second'])
    embeddings1 = model.encode(sentences1, convert_to_tensor=True)
    embeddings2 = model.encode(sentences2, convert_to_tensor=True)
    e1 = average_tensors(embeddings1)
    e2 = average_tensors(embeddings2)
    score = util.cos_sim(e1, e2).cpu().numpy().astype(np.float64)
    # Find top k pairs
    scores = util.cos_sim(embeddings1, embeddings2).cpu().numpy().astype(np.float64)
    heapPairs = []
    for i in range(len(sentences1)):
        for j in range(len(sentences2)):
            heapq.heappush(heapPairs, Pair([i, j], scores[i][j]))
    pairs = []
    if data["top_k"] > len(sentences1) * len(sentences2):
        return jsonify({'error': 'top_k too large'})
    for i in range(data["top_k"]):
        pair = heapq.heappop(heapPairs)
        pairs.append({"first": pair.data[0], "second": pair.data[1], "score": pair.score})
    return jsonify(score=score[0][0], 
                   pairs=pairs)

@app.route('/compare/one-one-v1', methods=['POST'])  # This route only accepts POST requests
def score_two_sentences_v1():
    data = request.get_json()
    if data is None:
        return jsonify({'error': 'Invalid JSON format'}), 400  # Bad request
    load_model()
    print(data)
    modelName = data['model_name']
    if modelName not in dictModel:
        return jsonify({'error': 'Model not load'})

    model = dictModel[modelName]
    sentences1 = nltk.tokenize.sent_tokenize(data['first'])
    sentences2 = nltk.tokenize.sent_tokenize(data['second'])
    embeddings1 = model.encode(sentences1, convert_to_tensor=True)
    embeddings2 = model.encode(sentences2, convert_to_tensor=True)
    e1 = average_tensors(embeddings1)
    e2 = average_tensors(embeddings2)
    score = util.cos_sim(e1, e2).cpu().numpy().astype(np.float64)
    # Find top k pairs
    scores = util.cos_sim(embeddings1, embeddings2).cpu().numpy().astype(np.float64)
    heapPairs = []
    for i in range(len(sentences1)):
        for j in range(len(sentences2)):
            heapq.heappush(heapPairs, Pair([sentences1[i], sentences2[j]], scores[i][j]))  # Push sentences instead of indices
    pairs = []
    if data["top_k"] > len(sentences1) * len(sentences2):
        return jsonify({'error': 'top_k too large'})
    for i in range(data["top_k"]):
        pair = heapq.heappop(heapPairs)
        pairs.append({"first": pair.data[0], "second": pair.data[1], "score": pair.score})
    return jsonify(score=score[0][0], pairs=pairs)


@app.route('/compare/many', methods=['POST'])  # This route only accepts POST requests
def score_many():
    data = request.get_json()
    load_model()
    if data is None:
        return jsonify({'error': 'Invalid JSON format'}), 400  # Bad request
    print(data)
    modelName = data['model_name']
    if modelName not in dictModel:
        return jsonify({'error': 'Model not load'})

    model = dictModel[modelName]
    sentences = nltk.tokenize.sent_tokenize(data['document'])
    paraphrases = util.paraphrase_mining(model, sentences)
    pairs = []
    for paraphrase in paraphrases[0:data["top_k"]]:
        score, i, j = paraphrase
        pairs.append({"first": i, "second": j, "score": score})
    return jsonify({'pairs': pairs})

if __name__ == '__main__':
    try:
        _create_unverified_https_context = ssl._create_unverified_context
    except AttributeError:
        pass
    else:
        ssl._create_default_https_context = _create_unverified_https_context
    app.run(debug=True)