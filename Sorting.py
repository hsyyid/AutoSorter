import string

from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from nltk.corpus import stopwords

en_stopwords = stopwords.words('english')


def text_process(mess):
    """
    Takes in a string of text, then performs the following:
    1. Remove all punctuation
    """
    # Check characters to see if they are in punctuation
    nopunc = [char for char in mess if char not in string.punctuation]

    # Check characters to see they are not new line
    nopunc = [char for char in nopunc if '\n' not in char]

    # Join the characters again to form the string.
    nopunc = ''.join(nopunc)

    # Now just remove any stopwords
    return [word for word in nopunc.split() if word.lower() not in en_stopwords]


def analyze(text, n_subjects):
    cv = CountVectorizer(analyzer=text_process).fit(text)
    messages = cv.transform(text)
    tfidf = TfidfTransformer().fit(messages).transform(messages)

    # Cluster
    kmeans = KMeans(n_clusters=n_subjects).fit(tfidf)
    return kmeans.labels_
