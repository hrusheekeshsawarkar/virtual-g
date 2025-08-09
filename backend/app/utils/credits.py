import re


WORD_PATTERN = re.compile(r"\b\w+\b", re.UNICODE)


def count_words(text: str | None) -> int:
    if not text:
        return 0
    return len(WORD_PATTERN.findall(text))


