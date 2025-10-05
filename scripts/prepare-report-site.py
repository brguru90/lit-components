#!/usr/bin/env python3
"""
Prepare the report site by creating index pages for coverage and lighthouse reports.
"""
import html
import pathlib
import sys


def main():
    root = pathlib.Path("site")
    
    # Check if coverage index exists
    coverage_index = root / "coverage" / "index.html"
    if not coverage_index.exists():
        print("Coverage index.html not found", file=sys.stderr)
        sys.exit(1)

    # Create lighthouse index
    lighthouse_dir = root / "lighthouse"
    html_files = sorted(p.relative_to(lighthouse_dir) for p in lighthouse_dir.rglob("*.html"))

    lighthouse_index = lighthouse_dir / "index.html"
    with lighthouse_index.open("w", encoding="utf-8") as f:
        f.write("<html><head><title>Lighthouse Reports</title></head><body><h1>Lighthouse Reports</h1>\n")
        if html_files:
            f.write("<ul>\n")
            for rel in html_files:
                href = html.escape(str(rel))
                f.write(f"  <li><a href='{href}'>{href}</a></li>\n")
            f.write("</ul>\n")
        else:
            f.write("<p>No Lighthouse HTML reports were found.</p>\n")
        f.write("</body></html>\n")

    # Create main index
    index = root / "index.html"
    index.write_text(
        """<html><head><title>VG Reports</title></head><body><h1>VG Report Portal</h1><ul><li><a href='storybook-static/index.html'>Storybook</a></li><li><a href='coverage/index.html'>Storybook Coverage</a></li><li><a href='lighthouse/index.html'>Lighthouse Reports</a></li></ul></body></html>""",
        encoding="utf-8"
    )
    
    print("Report site prepared successfully!")


if __name__ == "__main__":
    main()
