import mimetypes, docx, nltk
from models import compare, utility
from fastapi import UploadFile
from pypdf import PdfReader
from config import Config
from internal import DB

def validate_data_type(t, x):
    match t:
        case utility.SimilarityType.COS_SIM:
            return isinstance(x, float) and 0<=x<=1
        case utility.SimilarityType.BOOL:
            return isinstance(x, bool)
        case utility.SimilarityType.LEVEL:
            return isinstance(x, int) and 1<=x<=5
        case _:
            return False

def parse_text(text: str) -> utility.Text:
    paragraphs = text.splitlines(keepends=True)
    res = []
    pi = []
    for p in paragraphs:
        if len(p) > 1:
            start = len(res)
            res.extend(nltk.tokenize.sent_tokenize(p))
            pi.append([start, len(res)-1])
    return utility.Text(sentences=res, paragraph_index=pi)

def get_text(text: compare.Text):
    match text.type:
        case utility.TextType.CORPUS_DOCUMENT:
            t = DB().mongo[Config().COLLATION_DOCUMENT].find_one({"_id": text.document_id})['text']
            return utility.Text(sentences=t['sentences'], paragraph_index=t['paragraph_index'])
        case utility.TextType.RAW:
            return parse_text(text.raw)
        case _:
            raise Exception("Input value cannot be negative")

def file_content(upload_file: UploadFile) -> utility.File:
    match mimetypes.guess_extension(upload_file.content_type):
        case ".docx":
            reader = docx.Document(upload_file.file)
            return utility.File(file_name=upload_file.filename, raw='\n'.join([p.text for p in reader.paragraphs]))
        case ".pdf":
            reader = PdfReader(upload_file.file)
            data = "\n".join([page.extract_text(extraction_mode="layout") for page in reader.pages])
            words = []
            for w in data.split(' '):
                if len(w) > 0:
                    words.append(w)
            data = " ".join(words)
            raw = ""
            for s in data.split("\n"):
                if len(s) == 0:
                    continue
                if s[0].isupper() and len(raw) > 0:
                    raw += "\n"
                raw += s
            return utility.File(file_name=upload_file.filename, raw=raw)
        case ".txt":
            return utility.File(file_name=upload_file.filename, raw=upload_file.file.read())
        case _:
            return ""