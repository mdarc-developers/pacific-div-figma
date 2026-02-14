# Prize images

Add one image per prize here. Filename should match the prize `id` from `data/prizes.json` (e.g. `p1.jpg`, `p2.png`). Supported extensions: `.jpg`, `.jpeg`, `.png`.

- **Local:** Set `imageUri` in `data/prizes.json` to the id or filename without extension (e.g. `"imageUri": "p1"`), and add the corresponding file here. Register new ids in `app/(tabs)/prizes.tsx` in the `PRIZE_IMAGES` map.
- **URL:** Set `imageUri` to a full URL (e.g. `"imageUri": "https://example.com/prize.jpg"`) and no file here is needed.
