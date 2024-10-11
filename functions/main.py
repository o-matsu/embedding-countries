# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from typing import Any
from firebase_functions import https_fn, options
from firebase_functions.params import SecretParam
from openai import OpenAI, pydantic_function_tool
from pydantic import BaseModel
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
import numpy as np
import umap

OPENAI_API_KEY = SecretParam("OPENAI_API_KEY")

class Country(BaseModel):
    name: str
    answer: str

@https_fn.on_call(secrets=[OPENAI_API_KEY], memory=options.MemoryOption.GB_1, timeout_sec=300)
def embedding(req: https_fn.CallableRequest) -> Any:
    query = req.data["text"]
    if not query:
        return {
            "status": "error",
            "message": "query is empty"
        }

    openaiApiKey = OPENAI_API_KEY.value
    client = OpenAI(api_key=openaiApiKey)
    system_content = "あなたは優秀な歴史学者であり、地政学者です。\
      ユーザーの質問に対して、G20の各国・地域について、それぞれ簡潔に答えてください。\
      必ず「フランス、アメリカ、イギリス、ドイツ、日本、イタリア、カナダ、EU、アルゼンチン、オーストラリア、ブラジル、中国、インド、インドネシア、メキシコ、韓国、ロシア、サウジアラビア、南アフリカ、トルコ、AU」のそれぞれについて説明してください。\
      回答できない場合は「分からない」という説明にしてください。"
    completion = client.beta.chat.completions.parse(
      model="gpt-4o",
      messages=[
        {
          "role": "system",
          "content": system_content,
        },
        {
          "role": "user",
          "content": "{}について教えてください。".format(query),
        },
      ],
      tools=[pydantic_function_tool(Country)],
    )
    texts = list(
      map(
        lambda x: x.function.parsed_arguments.answer,
        completion.choices[0].message.tool_calls,
      )
    )
    embedding = client.embeddings.create(input=texts, model="text-embedding-3-small", dimensions=512)
    vectors = list(map(lambda x: x.embedding, embedding.data))

    reducer = umap.UMAP()
    vec2 = reducer.fit_transform(vectors)
    # reducer = umap.UMAP(n_components=3)
    # vec3 = reducer.fit_transform(vectors)

    similarity = cosine_similarity(vectors, vectors)
    cluster = KMeans(n_clusters=3, init="k-means++", random_state=0).fit(vectors)

    res = list(
      map(
        lambda x: {
          "country": x[1].function.parsed_arguments.name,
          "answer": x[1].function.parsed_arguments.answer,
          "embedding": vec2[x[0]].tolist(),
          "similarity": similarity[x[0]].tolist(),
          "cluster": int(cluster.labels_[x[0]]),
        },
        enumerate(completion.choices[0].message.tool_calls),
      )
    )

    return res