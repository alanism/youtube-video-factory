# Design System

Generated from `src/design/registry.ts`. Do not hand-edit layout, palette, or typography tables without updating the registry and rerunning `pnpm ytvf:design-docs`.

## Layout Templates

The factory ships 17 YouTube layouts. Each preview is a 16:9 wireframe rendered from the exact 1920x1080 frame geometry used by the HyperFrames compiler.

### title-full-presenter

![title-full-presenter](docs/assets/layouts/title-full-presenter.png)

Primary opening title and full-presenter geometry.

| Frame | Origin | Size |
|---|---:|---:|
| presenter | 0, 0 | 608 x 1080 |
| accentBar | 1820, 0 | 100 x 1080 |
| title | 650, 405 | 1030 x 260 |
| author | 650, 900 | 600 x 60 |

### title-circle-presenter

![title-circle-presenter](docs/assets/layouts/title-circle-presenter.png)

Opening title with a reduced presenter footprint.

| Frame | Origin | Size |
|---|---:|---:|
| presenter | 110, 240 | 400 x 400 |
| accentBar | 1820, 0 | 100 x 1080 |
| title | 650, 405 | 1030 x 260 |
| author | 650, 900 | 600 x 60 |

### feature-16x9-cinematic

![feature-16x9-cinematic](docs/assets/layouts/feature-16x9-cinematic.png)

Presenter commentary beside cinematic footage.

| Frame | Origin | Size |
|---|---:|---:|
| presenter | 0, 0 | 608 x 1080 |
| media | 650, 1 | 1270 x 850 |
| author | 650, 875 | 500 x 55 |
| bottomBar | 0, 980 | 1920 x 100 |

### feature-16x9-product

![feature-16x9-product](docs/assets/layouts/feature-16x9-product.png)

Presenter beside uncropped software or product media.

| Frame | Origin | Size |
|---|---:|---:|
| presenter | 0, 0 | 608 x 1080 |
| media | 650, 1 | 1270 x 850 |
| author | 650, 875 | 500 x 55 |
| bottomBar | 0, 980 | 1920 x 100 |

### feature-4x3

![feature-4x3](docs/assets/layouts/feature-4x3.png)

Presenter beside a 4:3 instructional feature.

| Frame | Origin | Size |
|---|---:|---:|
| presenter | 0, 0 | 608 x 1080 |
| media | 650, 1 | 1270 x 915 |
| author | 650, 930 | 500 x 45 |
| bottomBar | 0, 980 | 1920 x 100 |

### portrait-9x16-with-text

![portrait-9x16-with-text](docs/assets/layouts/portrait-9x16-with-text.png)

Commentary with portrait screen recording or mobile video.

| Frame | Origin | Size |
|---|---:|---:|
| presenter | 110, 240 | 400 x 400 |
| text | 650, 360 | 650 x 500 |
| media | 1312, 1 | 608 x 1079 |

### text-presenter-top-right

![text-presenter-top-right](docs/assets/layouts/text-presenter-top-right.png)

Text-led explanation with an upper-right presenter.

| Frame | Origin | Size |
|---|---:|---:|
| leftBar | 0, 0 | 27 x 1080 |
| text | 300, 300 | 1080 x 600 |
| presenter | 1470, 50 | 400 x 400 |

### text-presenter-bottom-right

![text-presenter-bottom-right](docs/assets/layouts/text-presenter-bottom-right.png)

Text-led argument with a lower-right presenter.

| Frame | Origin | Size |
|---|---:|---:|
| leftBar | 0, 0 | 27 x 1080 |
| text | 300, 100 | 1080 x 720 |
| presenter | 1480, 650 | 400 x 400 |

### feature-left-4x3

![feature-left-4x3](docs/assets/layouts/feature-left-4x3.png)

Large 4:3 media with right-side commentary.

| Frame | Origin | Size |
|---|---:|---:|
| media | 0, 0 | 1275 x 915 |
| caption | 50, 925 | 1230 x 80 |
| text | 1300, 225 | 570 x 350 |
| presenter | 1480, 650 | 400 x 400 |

### three-up-4x3

![three-up-4x3](docs/assets/layouts/three-up-4x3.png)

Three-way landscape comparison.

| Frame | Origin | Size |
|---|---:|---:|
| topBar | 0, 0 | 1920 x 100 |
| title | 17, 75 | 1400 x 120 |
| subtitle | 17, 300 | 1500 x 90 |
| media1 | 17, 500 | 600 x 431 |
| media2 | 659, 500 | 600 x 431 |
| media3 | 1300, 500 | 600 x 431 |
| caption1 | 17, 945 | 600 x 90 |
| caption2 | 659, 945 | 600 x 90 |
| caption3 | 1300, 945 | 600 x 90 |

### three-up-9x16

![three-up-9x16](docs/assets/layouts/three-up-9x16.png)

Three-way portrait or mobile comparison.

| Frame | Origin | Size |
|---|---:|---:|
| title | 17, 50 | 1500 x 120 |
| media1 | 362, 235 | 300 x 533 |
| media2 | 810, 235 | 300 x 533 |
| media3 | 1269, 235 | 300 x 533 |
| caption1 | 362, 780 | 300 x 160 |
| caption2 | 805, 780 | 310 x 160 |
| caption3 | 1263, 780 | 320 x 160 |
| bottomBar | 0, 980 | 1920 x 100 |

### feature-left-16x9

![feature-left-16x9](docs/assets/layouts/feature-left-16x9.png)

Cinematic left feature with right-side commentary.

| Frame | Origin | Size |
|---|---:|---:|
| topBar | 0, 0 | 1920 x 100 |
| media | 0, 100 | 1275 x 815 |
| caption | 50, 930 | 1230 x 70 |
| text | 1300, 225 | 570 x 350 |
| presenter | 1480, 650 | 400 x 400 |

### matrix-2x2

![matrix-2x2](docs/assets/layouts/matrix-2x2.png)

Presenter-led classification or strategy matrix.

| Frame | Origin | Size |
|---|---:|---:|
| leftBar | 0, 0 | 27 x 1080 |
| presenter | 110, 240 | 400 x 400 |
| matrix | 840, 240 | 800 x 600 |

### chart-cartesian

![chart-cartesian](docs/assets/layouts/chart-cartesian.png)

Presenter-led bar or line chart.

| Frame | Origin | Size |
|---|---:|---:|
| leftBar | 0, 0 | 27 x 1080 |
| presenter | 110, 240 | 400 x 400 |
| chart | 780, 230 | 1080 x 600 |

### chart-pie

![chart-pie](docs/assets/layouts/chart-pie.png)

Presenter-led composition or share breakdown.

| Frame | Origin | Size |
|---|---:|---:|
| leftBar | 0, 0 | 27 x 1080 |
| presenter | 110, 240 | 400 x 400 |
| chart | 780, 180 | 900 x 720 |

### open-canvas

![open-canvas](docs/assets/layouts/open-canvas.png)

Bounded custom diagrams, equations, or generated visuals.

| Frame | Origin | Size |
|---|---:|---:|
| leftBar | 0, 0 | 27 x 1080 |
| presenter | 110, 240 | 400 x 400 |
| canvas | 650, 100 | 1170 x 880 |

### quote

![quote](docs/assets/layouts/quote.png)

Quotation, thesis, source excerpt, or closing thought.

| Frame | Origin | Size |
|---|---:|---:|
| topBar | 0, 0 | 1920 x 100 |
| quote | 150, 390 | 1500 x 260 |
| attribution | 150, 800 | 900 x 70 |
| bottomBar | 0, 980 | 1920 x 100 |


## Palettes

The registry contains 31 original palettes plus 1 factory palette.

| ID | Name | Group | Swatches | Hex Values | Primary | Surface | Ink |
|---|---|---|---|---|---|---|---|
| `ucc-core` | UCC Core | channel | <span style="display:inline-block;width:34px;height:18px;background:#D94A55;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#101A2F;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#FFFBFB;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#E7B2BC;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#5A7690;border:1px solid #24202A22"></span> | `#D94A55` `#101A2F` `#FFFBFB` `#E7B2BC` `#5A7690` | #D94A55 | #FCEFF0 | #101A2F |
| `math` | Math | channel | <span style="display:inline-block;width:34px;height:18px;background:#2D6CDF;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#101A2F;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#DFEAFF;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#AFC4D4;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#F2F5F6;border:1px solid #24202A22"></span> | `#2D6CDF` `#101A2F` `#DFEAFF` `#AFC4D4` `#F2F5F6` | #2D6CDF | #DFEAFF | #101A2F |
| `science` | Science | channel | <span style="display:inline-block;width:34px;height:18px;background:#087F72;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#D89B32;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#D9F0EB;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#101A2F;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#F2F5F6;border:1px solid #24202A22"></span> | `#087F72` `#D89B32` `#D9F0EB` `#101A2F` `#F2F5F6` | #087F72 | #D9F0EB | #101A2F |
| `history` | History / Sociology | channel | <span style="display:inline-block;width:34px;height:18px;background:#8B3F35;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#24364B;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#EEE0D2;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#101A2F;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#F4F1EA;border:1px solid #24202A22"></span> | `#8B3F35` `#24364B` `#EEE0D2` `#101A2F` `#F4F1EA` | #8B3F35 | #EEE0D2 | #101A2F |
| `ela` | ELA | channel | <span style="display:inline-block;width:34px;height:18px;background:#8A4568;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#D97855;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#F1DFE8;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#101A2F;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#FFFBFB;border:1px solid #24202A22"></span> | `#8A4568` `#D97855` `#F1DFE8` `#101A2F` `#FFFBFB` | #8A4568 | #F1DFE8 | #101A2F |
| `ai` | AI / Technology | channel | <span style="display:inline-block;width:34px;height:18px;background:#1F9BB7;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#6557B8;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#D9EEF5;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#101A2F;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#F2F5F6;border:1px solid #24202A22"></span> | `#1F9BB7` `#6557B8` `#D9EEF5` `#101A2F` `#F2F5F6` | #1F9BB7 | #D9EEF5 | #101A2F |
| `product` | Product Tutorial | channel | <span style="display:inline-block;width:34px;height:18px;background:#316EA8;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#D94A55;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#DDE8F3;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#101A2F;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#F2F5F6;border:1px solid #24202A22"></span> | `#316EA8` `#D94A55` `#DDE8F3` `#101A2F` `#F2F5F6` | #316EA8 | #DDE8F3 | #101A2F |
| `pedagogy` | Pedagogy / Parents | channel | <span style="display:inline-block;width:34px;height:18px;background:#6F7F5B;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#B8694F;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#E5EADB;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#101A2F;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#F4F1EA;border:1px solid #24202A22"></span> | `#6F7F5B` `#B8694F` `#E5EADB` `#101A2F` `#F4F1EA` | #6F7F5B | #E5EADB | #101A2F |
| `midnight-heritage` | Midnight Heritage | inspiration | <span style="display:inline-block;width:34px;height:18px;background:#020202;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#223A5A;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#A2282B;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#38613F;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#BFB194;border:1px solid #24202A22"></span> | `#020202` `#223A5A` `#A2282B` `#38613F` `#BFB194` | #A2282B | #BFB194 | #020202 |
| `forest-harbor` | Forest Harbor | inspiration | <span style="display:inline-block;width:34px;height:18px;background:#133228;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#326042;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#B2CCDB;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#C3CDCE;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#D2C1A3;border:1px solid #24202A22"></span> | `#133228` `#326042` `#B2CCDB` `#C3CDCE` `#D2C1A3` | #326042 | #B2CCDB | #133228 |
| `blush-polo` | Blush Polo | inspiration | <span style="display:inline-block;width:34px;height:18px;background:#050505;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#374752;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#FCC5EC;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#E4E9EF;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#D8D4CB;border:1px solid #24202A22"></span> | `#050505` `#374752` `#FCC5EC` `#E4E9EF` `#D8D4CB` | #FCC5EC | #E4E9EF | #050505 |
| `anchor-crimson` | Anchor Crimson | inspiration | <span style="display:inline-block;width:34px;height:18px;background:#191C1F;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#41444C;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#9A9EA7;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#174041;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#C61F46;border:1px solid #24202A22"></span> | `#191C1F` `#41444C` `#9A9EA7` `#174041` `#C61F46` | #C61F46 | #9A9EA7 | #191C1F |
| `moss-atelier` | Moss Atelier | inspiration | <span style="display:inline-block;width:34px;height:18px;background:#050702;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#2D2D22;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#37420C;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#8A8567;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#F1F0EB;border:1px solid #24202A22"></span> | `#050702` `#2D2D22` `#37420C` `#8A8567` `#F1F0EB` | #37420C | #F1F0EB | #050702 |
| `old-money-sky` | Old Money Sky | inspiration | <span style="display:inline-block;width:34px;height:18px;background:#0E0F0E;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#581F0D;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#D6B488;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#F3F3F0;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#B8CBD2;border:1px solid #24202A22"></span> | `#0E0F0E` `#581F0D` `#D6B488` `#F3F3F0` `#B8CBD2` | #581F0D | #D6B488 | #0E0F0E |
| `espresso-fog` | Espresso Fog | inspiration | <span style="display:inline-block;width:34px;height:18px;background:#645143;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#CEBFB3;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#E0E3E7;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#8C8C8D;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#302423;border:1px solid #24202A22"></span> | `#645143` `#CEBFB3` `#E0E3E7` `#8C8C8D` `#302423` | #645143 | #CEBFB3 | #302423 |
| `hunter-rose` | Hunter Rose | inspiration | <span style="display:inline-block;width:34px;height:18px;background:#1F5132;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#C1898B;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#FFFFFF;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#552E23;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#0A0812;border:1px solid #24202A22"></span> | `#1F5132` `#C1898B` `#FFFFFF` `#552E23` `#0A0812` | #1F5132 | #FFFFFF | #0A0812 |
| `violet-taupe` | Violet Taupe | inspiration | <span style="display:inline-block;width:34px;height:18px;background:#95939B;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#CECECE;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#B5ACC1;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#E3C4AD;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#4A4541;border:1px solid #24202A22"></span> | `#95939B` `#CECECE` `#B5ACC1` `#E3C4AD` `#4A4541` | #B5ACC1 | #CECECE | #4A4541 |
| `ash-pink-electric` | Ash Pink Electric | inspiration | <span style="display:inline-block;width:34px;height:18px;background:#E2C2BD;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#B8C2C4;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#ECECEF;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#0083BB;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#232A30;border:1px solid #24202A22"></span> | `#E2C2BD` `#B8C2C4` `#ECECEF` `#0083BB` `#232A30` | #0083BB | #ECECEF | #232A30 |
| `wine-steel` | Wine & Steel | inspiration | <span style="display:inline-block;width:34px;height:18px;background:#EBF0F5;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#AC262D;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#751F22;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#25627C;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#131712;border:1px solid #24202A22"></span> | `#EBF0F5` `#AC262D` `#751F22` `#25627C` `#131712` | #AC262D | #EBF0F5 | #131712 |
| `denim-crimson` | Denim Crimson | inspiration | <span style="display:inline-block;width:34px;height:18px;background:#B8CED9;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#14192C;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#AB2728;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#9DA6A5;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#EBEBEB;border:1px solid #24202A22"></span> | `#B8CED9` `#14192C` `#AB2728` `#9DA6A5` `#EBEBEB` | #AB2728 | #B8CED9 | #14192C |
| `cyan-chocolate` | Cyan Chocolate | inspiration | <span style="display:inline-block;width:34px;height:18px;background:#719C95;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#C0D1BF;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#AECDE9;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#B9966E;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#381708;border:1px solid #24202A22"></span> | `#719C95` `#C0D1BF` `#AECDE9` `#B9966E` `#381708` | #719C95 | #AECDE9 | #381708 |
| `sport-bloom` | Sport Bloom | inspiration | <span style="display:inline-block;width:34px;height:18px;background:#038A61;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#E84579;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#F696C1;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#F5D6DB;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#BDC8C9;border:1px solid #24202A22"></span> | `#038A61` `#E84579` `#F696C1` `#F5D6DB` `#BDC8C9` | #038A61 | #F5D6DB | #14382E |
| `soft-rose-street` | Soft Rose Street | inspiration | <span style="display:inline-block;width:34px;height:18px;background:#EAE1E5;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#E3D1BF;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#C4BDB8;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#EBC4B9;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#D48179;border:1px solid #24202A22"></span> | `#EAE1E5` `#E3D1BF` `#C4BDB8` `#EBC4B9` `#D48179` | #D48179 | #EAE1E5 | #3C3435 |
| `orchid-citrus` | Orchid Citrus | inspiration | <span style="display:inline-block;width:34px;height:18px;background:#F096C8;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#0392F0;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#85A441;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#FFC025;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#EF790B;border:1px solid #24202A22"></span> | `#F096C8` `#0392F0` `#85A441` `#FFC025` `#EF790B` | #F096C8 | #FFC025 | #25351A |
| `cavalli-coast` | Cavalli Coast | inspiration | <span style="display:inline-block;width:34px;height:18px;background:#D7511D;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#E4D4BA;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#9CBAB6;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#558BA3;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#193048;border:1px solid #24202A22"></span> | `#D7511D` `#E4D4BA` `#9CBAB6` `#558BA3` `#193048` | #D7511D | #9CBAB6 | #193048 |
| `bordeaux-noir` | Bordeaux Noir | inspiration | <span style="display:inline-block;width:34px;height:18px;background:#191917;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#6D6864;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#FCD6BC;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#5B191D;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#2D1012;border:1px solid #24202A22"></span> | `#191917` `#6D6864` `#FCD6BC` `#5B191D` `#2D1012` | #5B191D | #FCD6BC | #191917 |
| `kalamata-harbor` | Kalamata Harbor | inspiration | <span style="display:inline-block;width:34px;height:18px;background:#080808;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#62424D;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#545E3A;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#476482;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#E2E1DB;border:1px solid #24202A22"></span> | `#080808` `#62424D` `#545E3A` `#476482` `#E2E1DB` | #62424D | #545E3A | #080808 |
| `yacht-club` | Yacht Club | inspiration | <span style="display:inline-block;width:34px;height:18px;background:#28A476;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#A7C3B2;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#F5F5F5;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#0289CD;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#0244A6;border:1px solid #24202A22"></span> | `#28A476` `#A7C3B2` `#F5F5F5` `#0289CD` `#0244A6` | #28A476 | #A7C3B2 | #0244A6 |
| `peach-veil` | Peach Veil | inspiration | <span style="display:inline-block;width:34px;height:18px;background:#1C1813;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#AA9485;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#BF9F92;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#DCC9C3;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#E4E4E4;border:1px solid #24202A22"></span> | `#1C1813` `#AA9485` `#BF9F92` `#DCC9C3` `#E4E4E4` | #BF9F92 | #DCC9C3 | #1C1813 |
| `tiger-smoke` | Tiger Smoke | inspiration | <span style="display:inline-block;width:34px;height:18px;background:#E75323;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#F46B27;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#E7C7B9;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#C2C2C2;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#453F3D;border:1px solid #24202A22"></span> | `#E75323` `#F46B27` `#E7C7B9` `#C2C2C2` `#453F3D` | #E75323 | #E7C7B9 | #453F3D |
| `ivory-dusk` | Ivory Dusk | inspiration | <span style="display:inline-block;width:34px;height:18px;background:#182131;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#58586B;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#D8D4DE;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#DFD7CD;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#BEB6B0;border:1px solid #24202A22"></span> | `#182131` `#58586B` `#D8D4DE` `#DFD7CD` `#BEB6B0` | #58586B | #D8D4DE | #182131 |
| `ivory-dusk-editorial` | Ivory Dusk Editorial | factory | <span style="display:inline-block;width:34px;height:18px;background:#EEE6D8;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#D8CBB8;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#24202A;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#5F5363;border:1px solid #24202A22"></span><span style="display:inline-block;width:34px;height:18px;background:#A6793B;border:1px solid #24202A22"></span> | `#EEE6D8` `#D8CBB8` `#24202A` `#5F5363` `#A6793B` | #A6793B | #D8CBB8 | #24202A |

## Typography

The public typography system is IBM Plex complete:

- IBM Plex Sans for body text, captions, and modern headlines
- IBM Plex Serif for editorial headlines and long-form authority
- IBM Plex Mono for technical labels, scene IDs, code, and research-style layouts

Newsreader remains vendored as an optional legacy/editorial font for older compositions, but the five built-in typography systems below use the IBM Plex family.

| ID | Name | Description | Title | Body | Caption | Mono |
|---|---|---|---|---|---|---|
| `editorial-authority` | Editorial Authority | IBM Plex Serif headline · IBM Plex Sans body | IBM Plex Serif | IBM Plex Sans | IBM Plex Sans | IBM Plex Mono |
| `modern-clarity` | Modern Clarity | IBM Plex Sans headline · IBM Plex Serif body | IBM Plex Sans | IBM Plex Serif | IBM Plex Sans | IBM Plex Mono |
| `humanist-voice` | Humanist Voice | IBM Plex Sans headline · IBM Plex Serif body | IBM Plex Sans | IBM Plex Serif | IBM Plex Sans | IBM Plex Mono |
| `research-notebook` | Research Notebook | Mono headline · Sans body | IBM Plex Mono | IBM Plex Sans | IBM Plex Sans | IBM Plex Mono |
| `technical-signal` | Technical Signal | Mono headline · Mono body | IBM Plex Mono | IBM Plex Mono | IBM Plex Sans | IBM Plex Mono |

## Design Packs

| ID | Name | Palette | Typography | Default Layout | Motion |
|---|---|---|---|---|---|
| `ivory-dusk` | Ivory Dusk | ivory-dusk | modern-clarity | feature-left-16x9 | soft-continuity |
| `ivory-dusk-editorial` | Ivory Dusk Editorial | ivory-dusk-editorial | editorial-authority | feature-left-4x3 | editorial-restraint |

## Add A New Design

1. Create a project-local design pack JSON using `examples/design-pack.json`.
2. Keep every palette to exactly five colors.
3. Choose typography from IBM Plex Sans, IBM Plex Serif, and IBM Plex Mono unless a licensed project font is vendored with notices.
4. Run `pnpm ytvf design add <project> <design-pack.json>`.
5. Run `pnpm ytvf design preview <project>` for a local catalog.
6. Promote reusable design packs only after recording provenance, intended use, and preview evidence.
