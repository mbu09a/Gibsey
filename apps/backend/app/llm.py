"""LLM utility functions for generating answers using GPT-4."""

from typing import Any, Dict, List

from openai import OpenAI

from .config import get_settings

settings = get_settings()
client = OpenAI(api_key=settings.openai_api_key)


def generate_answer(question: str, context: List[Dict[str, Any]]) -> str:
    """Generate an answer using GPT-4 based on the provided context."""
    try:
        # Format the context into a single string
        context_str = "\n\n".join(
            [
                f"---\nTitle: {item['title']}\nContent: {item['content']}"
                for item in context
            ]
        )

        # Create the prompt
        messages = [
            {
                "role": "system",
                "content": """You are a helpful assistant that answers questions based on the provided context.
                If the context doesn't contain the answer, say "I don't know" instead of making up an answer.
                Keep your response concise and to the point.""",
            },
            {
                "role": "user",
                "content": f"""Context:
                {context_str}
                
                Question: {question}
                Answer:""",
            },
        ]

        # Call the OpenAI API
        response = client.chat.completions.create(
            model="gpt-4", messages=messages, temperature=0.7, max_tokens=500
        )

        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating answer: {str(e)}")
        return "I'm sorry, I encountered an error while generating an answer. Please try again later."
