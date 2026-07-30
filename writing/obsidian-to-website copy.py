import html
import os
import re
import shutil
import json

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "output")
SOURCE_CSS = os.path.join(SCRIPT_DIR, "source.css")
CUSTOM_MARKDOWN = os.path.join(SCRIPT_DIR, "custom_markdown.json")

DEFAULT_CSS = """
:root{
    --background:#262626;
    --text:#c5b8a1;
    --highlight:#d35645;
    --dim:#9e9e9e;
    --code-background:#202020;
    --code-text:#6c99bb;
    --separators:#333333;
    --max-width: 43em;
    --page-margin: 5em;
    --font-size: 1rem;
    --small-font-size: 0.7rem;
    --paragraph-gap: 0.5rem;
    --heading-gap: 1rem;
    --tab-width: 2;
}

body{
    background:var(--background);
    color:var(--text);
    font-family:"Inter", sans-serif;
    font-size:var(--font-size);
    margin:var(--page-margin) 0;
    letter-spacing: 0.05rem;
    word-spacing: 0.2rem;
    line-height: 1.5rem;
}

main{
    max-width:var(--max-width);
    margin:auto;
}

p {
    white-space: pre-wrap;
    margin: 0 0 var(--paragraph-gap) 0;
    tab-size: var(--tab-width);
}

h1,
h2,
h3,
h4,
h5,
h6{
    margin: var(--heading-gap) 0 var(--paragraph-gap) 0;
}

a{
    color:var(--highlight);
    text-decoration:none;
}

a:hover{
    text-decoration:underline;
}

blockquote{
    border-left:2px solid var(--highlight);
    padding-left:1em;
    margin:0;
    color:var(--text);
}

.footnotes{
    margin-top:3em;
    font-size:var(--small-font-size);
    line-height: 1.2rem;
}

.footnote{
    display:flex;
    margin-bottom:0.4em;
}

.footnote-number a{
    color:var(--dim);
    margin: 0.5rem;
    text-decoration:underline;
}

sup a{
    color:var(--highlight);
}

code{
    background:var(--code-background);
    color:var(--code-text);
    padding:0.15em 0.35em;
    border-radius:0.2em;
    font-family:Consolas, Monaco, monospace;
    font-size:0.9em;
}

hr{
    border:none;
    border-top:2px solid var(--separators);
    margin:2em 0;
}
"""

def load_custom_markdown():
    if not os.path.exists(CUSTOM_MARKDOWN):
        return []

    with open(CUSTOM_MARKDOWN, encoding="utf8") as f:
        data = json.load(f)

    rules = []

    for rule in data:
        detect = rule.get("detection", {})
        replace = rule.get("replacement", {})

        prefix = detect.get("prefix")
        suffix = detect.get("suffix")

        if prefix is None or suffix is None:
            continue

        rules.append({
            "detect_prefix": prefix,
            "detect_suffix": suffix,
            "replace_prefix": replace.get("prefix", ""),
            "replace_suffix": replace.get("suffix", "")
        })

    return rules

def apply_custom_markdown(line, rules):
    for rule in rules:

        p = rule["detect_prefix"]
        s = rule["detect_suffix"]

        start = 0

        while True:

            a = line.find(p, start)

            if a == -1:
                break

            b = line.find(s, a + len(p))

            if b == -1:
                break

            inside = line[
                a + len(p):
                b
            ]

            line = (
                line[:a]
                + rule["replace_prefix"]
                + inside
                + rule["replace_suffix"]
                + line[b + len(s):]
            )

            start = (
                a
                + len(rule["replace_prefix"])
                + len(inside)
                + len(rule["replace_suffix"])
            )

    return line

def build_page_index(root):
    """
    Returns:
        page_index:
            {
                "page name": "subfolder/page name.html",
                ...
            }
    """

    index = {}

    for current, _, files in os.walk(root):
        for file in files:
            if not file.lower().endswith(".md"):
                continue

            page = os.path.splitext(file)[0]

            rel = os.path.relpath(
                os.path.join(current, file),
                root
            )

            html_rel = os.path.splitext(rel)[0] + ".html"

            if page in index:
                print(f'Warning: duplicate page "{page}"')
                print(f'    {index[page]}')
                print(f'    {html_rel}')
                print("Using first occurrence.\n")
                continue

            index[page] = html_rel.replace("\\", "/")

    return index

def make_css():
    css = DEFAULT_CSS

    if os.path.exists(SOURCE_CSS):
        css += "\n\n/* Overrides */\n"
        with open(SOURCE_CSS, encoding="utf8") as f:
            css += f.read()

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with open(os.path.join(OUTPUT_DIR, "style.css"), "w", encoding="utf8") as f:
        f.write(css)


def inline_markup(text, current_output, page_index, custom_markdown):
    text = html.escape(text)

    # page hyperlinks
    def make_page_link(page, alias=None):
        page = page.strip()

        if alias is None:
            alias = page

        if page not in page_index:
            return alias

        target = page_index[page]

        current_dir = os.path.dirname(
            os.path.relpath(current_output, OUTPUT_DIR)
        )

        href = os.path.relpath(
            os.path.join(OUTPUT_DIR, target),
            os.path.join(OUTPUT_DIR, current_dir)
        )

        href = href.replace("\\", "/")

        return f'<a href="{href}">{alias}</a>'


    # [[page|alias]]
    text = re.sub(
        r"\[\[([^\]|]+)\|([^\]]+)\]\]",
        lambda m: make_page_link(
            m.group(1),
            m.group(2)
        ),
        text,
    )

    # [[page]]
    text = re.sub(
        r"\[\[([^\]]+)\]\]",
        lambda m: make_page_link(
            m.group(1)
        ),
        text,
    )

    # footnotes
    text = re.sub(
        r"\[\^(\d+)\]",
        lambda m:
        f'<sup><a href="#fn{m.group(1)}" id="ref{m.group(1)}">[{m.group(1)}]</a></sup>',
        text,
    )

    # inline code
    text = re.sub(
        r"`([^`]+)`",
        lambda m: f"<code>{m.group(1)}</code>",
        text,
    )

    # bold and italics
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"\*(.+?)\*", r"<em>\1</em>", text)

    return apply_custom_markdown(text, custom_markdown)


def parse_markdown(path, output_file, page_index, custom_markdown):
    with open(path, encoding="utf8") as f:
        lines = f.readlines()

    title = os.path.splitext(os.path.basename(path))[0]

    html_lines = [f"<h1>{html.escape(title)}</h1>"]

    footnotes = {}

    in_blockquote = False
    blockquote_lines = []

    pending_empty_line = False

    for line in lines:
        m = re.match(r"\[\^(\d+)\]:\s*(.*)", line)

        if m:
            footnotes[m.group(1)] = inline_markup(m.group(2), output_file, page_index, custom_markdown)
            continue

        line = line.rstrip("\n")

        if not line:
            pending_empty_line = True
            continue

        if line.startswith(">"):
            if not in_blockquote:
                if pending_empty_line:
                    html_lines.append("&nbsp;")

                in_blockquote = True
                blockquote_lines = []

            pending_empty_line = False

            blockquote_lines.append(
                inline_markup(
                    line[1:].strip(),
                    output_file,
                    page_index,
                    custom_markdown
                )
            )
            continue

        if in_blockquote:
            html_lines.append(
                "<blockquote>"
                + "<br>\n".join(blockquote_lines)
                + "</blockquote>"
            )
            in_blockquote = False

        if pending_empty_line:
            html_lines.append("&nbsp;")
            pending_empty_line = False

        if re.fullmatch(r"-{3,}", line.strip()):
            html_lines.append("<hr/>")
            continue

        h = re.match(r"(#{1,6})\s+(.*)", line)

        if h:
            level = len(h.group(1))
            html_lines.append(
                f"<h{level}>{inline_markup(h.group(2), output_file, page_index, custom_markdown)}</h{level}>"
            )
            continue

        html_lines.append("<p>" + inline_markup(line, output_file, page_index, custom_markdown) + "</p>")

    if in_blockquote:
        html_lines.append(
            "<blockquote>"
            + "<br>\n".join(blockquote_lines)
            + "</blockquote>"
        )

    if footnotes:
        html_lines.append('<div class="footnotes">')

        for num, txt in footnotes.items():
            html_lines.append(
                f'''
<div class="footnote" id="fn{num}">
<div class="footnote-number">
<a href="#ref{num}">{num}</a>
</div>
<div>{txt}</div>
</div>
'''
            )

        html_lines.append("</div>")

    current_page_dir = os.path.dirname(
        os.path.relpath(
            output_file,
            OUTPUT_DIR
        )
    )

    css = os.path.relpath(
        os.path.join(
            OUTPUT_DIR,
            "style.css"
        ),
        os.path.join(
            OUTPUT_DIR,
            current_page_dir
        )
    )

    css = css.replace("\\", "/")

    return f"""<!doctype html>
<html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="{css}">
<title>{html.escape(title)}</title>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet">
</head>
<body>
<main>
{os.linesep.join(html_lines)}
</main>
</body>
</html>"""


def main():
    inp = input("Input directory (blank=current): ").strip()

    if not inp:
        inp = "."

    inp = os.path.abspath(inp)

    page_index = build_page_index(inp)
    custom_markdown = load_custom_markdown()

    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)

    os.makedirs(OUTPUT_DIR)

    make_css()

    for root, _, files in os.walk(inp):
        for file in files:
            if not file.lower().endswith(".md"):
                continue

            src = os.path.join(root, file)

            rel = os.path.relpath(src, inp)
            dst = os.path.join(
                OUTPUT_DIR,
                os.path.splitext(rel)[0] + ".html"
            )

            os.makedirs(os.path.dirname(dst), exist_ok=True)

            with open(dst, "w", encoding="utf8") as f:
                f.write(
                    parse_markdown(
                        src,
                        dst,
                        page_index,
                        custom_markdown
                    )
                )

    print("Done.")


if __name__ == "__main__":
    main()