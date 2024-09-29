# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from typing import Any
from firebase_functions import https_fn, options
from firebase_functions.params import SecretParam
from openai import OpenAI, pydantic_function_tool
from pydantic import BaseModel
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
    completion = client.beta.chat.completions.parse(
      model="gpt-4o",
      messages=[
        {
          "role": "system",
          "content": "あなたは優秀な歴史学者であり、地政学者です。ユーザーの質問に対して、G20の各国について、それぞれ簡潔に答えてください。情報の無い国については、「分からない」という説明にして必ず20カ国全ての国について説明してください。",
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

    res = list(
      map(
        lambda x: {
          "country": x[1].function.parsed_arguments.name,
          "answer": x[1].function.parsed_arguments.answer,
          "embedding": vec2[x[0]].tolist(),
        },
        enumerate(completion.choices[0].message.tool_calls),
      )
    )

    return res