#!/usr/bin/env python3
"""Generate favicons and Open Graph images (ASSET_MANIFEST §3) from the content files.

Usage: python3 tools/make-assets.py <dir with static Archivo instances + IBMPlexMono-Medium.ttf>
Needs: Pillow (with raqm), fontTools, PyYAML. Writes into public/.
Static instances are made from Archivo[wdth,wght].ttf with fontTools.varLib.instancer:
archivo-62-900.ttf (wdth 62, wght 900), archivo-75-800.ttf, archivo-100-500.ttf.
"""
import sys, re, textwrap
from pathlib import Path
import yaml
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen

ROOT = Path(__file__).resolve().parent.parent
FONTS = Path(sys.argv[1])
PUB = ROOT / 'public'
PAPER, INK, GRAPHITE, SIGNAL, RULE = '#F3F1EC', '#111111', '#5E5C57', '#C8361A', '#D9D5CC'

display = lambda s: ImageFont.truetype(str(FONTS / 'archivo-62-900.ttf'), s)
heading = lambda s: ImageFont.truetype(str(FONTS / 'archivo-75-800.ttf'), s)
body = lambda s: ImageFont.truetype(str(FONTS / 'archivo-100-500.ttf'), s)
mono = lambda s: ImageFont.truetype(str(FONTS / 'IBMPlexMono-Medium.ttf'), s)


def favicon_svg():
    font = TTFont(FONTS / 'archivo-62-900.ttf')
    gs, cmap = font.getGlyphSet(), font.getBestCmap()
    upm = font['head'].unitsPerEm
    paths, x = [], 0
    bounds = BoundsPen(gs)
    for ch in 'AP':
        g = gs[cmap[ord(ch)]]
        pen = SVGPathPen(gs)
        g.draw(pen)
        paths.append((x, pen.getCommands()))
        from fontTools.pens.transformPen import TransformPen
        g.draw(TransformPen(bounds, (1, 0, 0, 1, x, 0)))
        x += g.width
    xmin, ymin, xmax, ymax = bounds.bounds
    w, h = xmax - xmin, ymax - ymin
    size = 64
    scale = (size * 0.78) / max(w, h)
    tx = (size - w * scale) / 2 - xmin * scale
    ty = (size + h * scale) / 2 + ymin * scale
    groups = ''.join(f'<path transform="translate({dx} 0)" d="{d}"/>' for dx, d in paths)
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}">'
        f'<rect width="{size}" height="{size}" fill="{PAPER}"/>'
        f'<g fill="{INK}" transform="translate({tx:.2f} {ty:.2f}) scale({scale:.5f} {-scale:.5f})">{groups}</g></svg>\n'
    )
    (PUB / 'favicon.svg').write_text(svg)


def favicon_png(px, name):
    im = Image.new('RGB', (px, px), PAPER)
    d = ImageDraw.Draw(im)
    f = display(int(px * 0.74))
    l, t, r, b = d.textbbox((0, 0), 'AP', font=f)
    d.text(((px - (r - l)) / 2 - l, (px - (b - t)) / 2 - t), 'AP', font=f, fill=INK)
    im.save(PUB / name, optimize=True)


def wrap_px(d, text, font, width):
    words, lines, cur = text.split(), [], ''
    for w in words:
        trial = (cur + ' ' + w).strip()
        if d.textlength(trial, font=font) <= width:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def og(name, kicker, title, line, stamp=None):
    W, H, M = 1200, 630, 72
    im = Image.new('RGB', (W, H), PAPER)
    d = ImageDraw.Draw(im)
    d.text((M, M - 8), kicker.upper(), font=mono(20), fill=INK)
    if stamp:
        f = mono(18)
        tw = d.textlength(stamp, font=f)
        x1 = W - M
        d.rectangle((x1 - tw - 24, M - 14, x1, M + 22), outline=INK, width=2)
        d.text((x1 - tw - 12, M - 8), stamp, font=f, fill=INK)
    # Title: largest display size that fits on at most two lines.
    for size in (170, 150, 130, 112, 96, 84):
        f = display(size)
        lines = wrap_px(d, title.upper(), f, W - 2 * M)
        if len(lines) <= 2:
            break
    y = 128
    for ln in lines:
        d.text((M, y), ln, font=f, fill=INK)
        y += int(size * 0.88)
    fq = body(36)
    qlines = wrap_px(d, line, fq, W - 2 * M - 80)[:3]
    y += 24
    for ln in qlines:
        d.text((M, y), ln, font=fq, fill=INK)
        y += 46
    d.line((M, H - M - 22, W - M, H - M - 22), fill=INK, width=2)
    d.text((M, H - M - 6), "ASHUTOSH PARIDA · BITS PILANI '27", font=mono(18), fill=GRAPHITE)
    (PUB / 'og').mkdir(exist_ok=True)
    im.save(PUB / 'og' / f'{name}.png', optimize=True)


def frontmatter(p):
    return yaml.safe_load(re.match(r'^---\n(.*?)\n---', p.read_text(), re.S).group(1))


def main():
    favicon_svg()
    favicon_png(32, 'favicon-32.png')
    favicon_png(180, 'apple-touch-icon.png')
    site = yaml.safe_load((ROOT / 'src/content/site.yaml').read_text())
    labels = {e['id']: e['label'] for e in yaml.safe_load((ROOT / 'src/content/evidence.yaml').read_text())}
    og('default', site['institution_line'], site['name'], ' '.join(site['statement']))
    og('work', 'Work · Index', 'Work', 'Nine projects. Every number labelled with how it was measured.')
    og('lab', 'Lab', 'Lab', 'Supervised physics research, small experiments and product writing.')
    og('about', 'About', site['name'], ' · '.join(site['descriptor']) + '.')
    for p in sorted((ROOT / 'src/content/projects').glob('*.md')):
        fm = frontmatter(p)
        kicker = f"Report {fm['number']}" if fm['tier'] == 'flagship' else 'Brief'
        og(fm['slug'], kicker, fm['title'], fm['question'], labels.get(fm.get('primary_evidence')))
    for p in sorted((ROOT / 'src/content/lab').glob('*.md')):
        fm = frontmatter(p)
        og(f"lab-{fm['slug']}", 'Lab · Research', fm['title'], fm['question'], labels.get(fm['evidence']))
    print('assets written')


main()
