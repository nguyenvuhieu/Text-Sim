from sentence_transformers import util
from fastapi import APIRouter, Body
from util import get_text
from models import compare, utility, corpus as corpus_model
from internal import Model
from config import Config
from internal import DB

router = APIRouter(prefix="/compare", tags=["compare"])

@router.post('/one-many', response_model=compare.OneManyResponse)  # This route only accepts POST requests
def one_many(req: compare.OneManyRequest = Body(...)):
    m = len(req.many)
    model = Model().get_model(req.model)
    t1 = get_text(req.one)
    t2 = [get_text(item) for item in req.many]
    e1 = model.encode(t1.sentences, convert_to_tensor=True)
    e2 = [model.encode(item.sentences, convert_to_tensor=True) for item in t2]
    s1 = set()
    s2 = [set() for _ in range(m)]
    pairs = [[] for _ in range(m)]
    # Find top k pairs
    scores = [util.cos_sim(e1, item) for item in e2]
    print(scores)
    for im in range(len(req.many)):
        for i in range(len(t1.sentences)):
            for j in range(len(t2[im].sentences)):
                if scores[im][i][j] > req.threshold:
                    s1.add(i)
                    s2[im].add(j)
                    pairs[im].append(compare.Pair(first_sentence=i,second_sentence=j, score=scores[im][i][j]))
    similarities = [len(s2[im])/len(t2[im].sentences) for im in range(len(req.many))]
    return compare.OneManyResponse(one=t1, many=t2, similarity=len(s1)/len(t1.sentences), similarities=similarities, pairs=pairs)

@router.post('/corpus', response_model=compare.CorpusResponse)  # This route only accepts POST requests
def corpus(req: compare.CorpusRequest = Body(...)):
    model = Model().get_model(req.model)
    text = get_text(req.text)
    corpus = [[corpus_model.Document.model_validate(d) for d in DB().mongo[Config().COLLATION_DOCUMENT].find({"corpus_id": corpus_id})] for corpus_id in req.corpus_ids]
    e1 = model.encode(text.sentences, convert_to_tensor=True)
    e2 = [[model.encode(document.text.sentences, convert_to_tensor=True) for document in documents] for documents in corpus]
    score = [[util.cos_sim(e1, ed) for ed in eds] for eds in e2]
    s1 = set()
    corpus_documents = [[]]*len(corpus)
    nc = len(corpus)
    for ic in range(nc):
        for id in range(len(corpus[ic])):
            s2 = set()
            pairs = []
            for i1 in range(len(text.sentences)):
                for i2 in range(len(corpus[ic][id].text.sentences)):
                    if score[ic][id][i1][i2] > req.threshold:
                        s1.add(i1)
                        s2.add(i2)
                        pairs.append(compare.Pair(first_sentence=i1, second_sentence=i2, score=score[ic][id][i1][i2]))
            corpus_documents[ic].append(compare.CorpusDocument(document=corpus[ic][id], similarity=len(s2)/len(corpus[ic][id].text.sentences), pairs=pairs))

    return compare.CorpusResponse(text=text, similarity=len(s1)/len(text.sentences), corpus_documents=corpus_documents)