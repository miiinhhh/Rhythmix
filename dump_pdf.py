from pathlib import Path
from PyPDF2 import PdfReader
p = Path('Database/TuneVault_BaiTapLon.pdf')
print('exists', p.exists())
reader = PdfReader(str(p))
print('pages', len(reader.pages))
for i, page in enumerate(reader.pages[:5]):
    print('--- page', i+1)
    text = page.extract_text() or ''
    print(text[:1400])
