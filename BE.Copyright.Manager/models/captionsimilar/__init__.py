from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

class CaptionSimilar:
    
    modelText = None

    def __init__(self) -> None:
        self.modelText = SentenceTransformer('bert-base-nli-mean-tokens')

    def calculateSimilar(self, lstSentence):
        sentence_vecs = self.modelText.encode(lstSentence)
        cos = cosine_similarity([sentence_vecs[0]], sentence_vecs[1:])
        return cos