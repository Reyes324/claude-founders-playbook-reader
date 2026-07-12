#!/usr/bin/env python3
"""Assemble src/template.html + src/data/*.json + src/fonts/*.b64 + src/book.json into index.html."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"


def main():
    tpl = (SRC / "template.html").read_text(encoding="utf-8")
    chapters_json = (SRC / "data" / "chapters.json").read_text(encoding="utf-8")
    images_json = (SRC / "data" / "images.json").read_text(encoding="utf-8")
    font_normal = (SRC / "fonts" / "fraunces-normal.b64").read_text(encoding="utf-8").strip()
    font_italic = (SRC / "fonts" / "fraunces-italic.b64").read_text(encoding="utf-8").strip()
    chat_logic_js = (SRC / "js" / "chat-logic.js").read_text(encoding="utf-8")
    book = json.loads((SRC / "book.json").read_text(encoding="utf-8"))

    out = tpl.replace("__CHAPTERS_JSON__", chapters_json)
    out = out.replace("__IMAGES_JSON__", images_json)
    out = out.replace("__FONT_NORMAL_B64__", font_normal)
    out = out.replace("__FONT_ITALIC_B64__", font_italic)
    out = out.replace("__CHAT_LOGIC_JS__", chat_logic_js)
    out = out.replace("__PAGE_TITLE__", book["page_title"])
    out = out.replace("__COVER_EYEBROW__", book["cover_eyebrow"])
    out = out.replace("__COVER_TITLE_HTML__", book["cover_title_html"])
    out = out.replace("__COVER_SUBTITLE__", book["cover_subtitle"])
    out = out.replace("__COVER_AUTHORS__", book["cover_authors"])
    out = out.replace("__BOOK_TITLE_JS__", json.dumps(book["book_title"], ensure_ascii=False))

    out_path = ROOT / "index.html"
    out_path.write_text(out, encoding="utf-8")
    print(f"wrote {out_path} ({len(out)} bytes)")


if __name__ == "__main__":
    main()
