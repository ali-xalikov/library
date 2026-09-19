import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

let BASE_URL = 'https://1a40451337cdbc1f.mokky.dev';
try {
  const env = readFileSync(join(ROOT, '.env'), 'utf8');
  const m = env.match(/VITE_MOKKY_BASE_URL\s*=\s*(.+)/);
  if (m) BASE_URL = m[1].trim();
} catch {
  /* .env mavjud emas — default ishlatiladi */
}

const COVERS = [
  'https://assets.asaxiy.uz/product/items/desktop/d19544ae709580379cd2523b0e72c86d2022101611515221647SmiczaRuoj.jpg',
  'https://assets.asaxiy.uz/product/items/desktop/a4814fbe4abdad91842ef1795dcd465b2022101611040080094FoCWsR1iGh.jpg.webp',
  'https://assets.asaxiy.uz/product/items/desktop/f3da09992c98b41b9a8d57649fe7709b20250816221256503508jJzBZufiy.jpg.webp',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXurZaGyWs0vIeEy7Eu9b_tS9YsULiFLrl7qz7g7LBt1lVS1BdTr9wGQ0&s=10',
  'https://library.tiiame.uz//storage/resources/2026/1AwAiwBygy5MVBxn3Dx1TEXF9YG6Lkq4AAbKE8xj.jpg',
  'https://assets.asaxiy.uz/product/items/desktop/f4be00279ee2e0a53eafdaa94a151e2c2022073114505139263ZqZM7w38tz.jpg.webp',
  'https://library.tdau.uz/storage/magazineIssues/photo/12_639ab519dfe37_1671083289.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRS0aX_vn56vQ07ppgPaYh-EGAv8QglZ0_imueyJZgcDQ2XqqmaK9hQhXo&s=10',
  'https://akbt.urdu.uz/storage/books/face/images/25083_67e3e9a0e7a86_1742989728.jpg',
  'https://media.natlib.uz/file/get/be0ff48c-58cc-4097-b8d6-78aea9ea9716',
  'https://assets.asaxiy.uz/product/items/desktop/5e15c172ee9ae.jpg.webp',
  'https://hilolnashr.uz/image/cache/catalog/001-Kitoblar/003_boshqalar/002_badiy/06.2025/TV-550x550h.jpg',
  'https://cdn.asaxiy.uz/asaxiy-content/product/items/desktop/ddd99d8ccaf46a41b4c581080f5a5d342023081322383385420gLPm1VhAMS.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-lOKLeRz6Bk8l9FcKrzxkPq8O3yov6Z_0gsaOL9chU7_zFYKpzzV06Af-&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9M7bX0yrAu1lmbIKYCi-y3Q3E-uIQDMk9irtAP4HskQ&s=10',
  'https://assets.asaxiy.uz/product/items/desktop/f6237388378c22b5db2bf5d25d64cb412020042918133417066U9cuHU25hg.jpg.webp',
  'https://akbt.urdu.uz/storage/books/face/images/25112_67de3e9121481_1742618257.jpg',
  'https://images.uzum.uz/d4ljf2dsp2tr82i7ock0/t_product_540_high.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGNZQ-FVttQTTDwCbGJHL_QgEMyaV-50d76wCjvEDBKKdxIQgsd-paOLo&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHrgYFBg64Utxyp4YCo2iapUmkfvPz6a4nyC7rvwp5YyelHVPATA2lGICj&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmI7byiVb-pac0U0uiMoFR41rRCPawlbRGGKX9QCXMNGeBNbz-mCeXuiT4&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrGk7UVBc1XO0jN3UWuYgm_-SuYHu-3rhgm9TGaowcTQ&s=10',
  'https://akbt.urdu.uz/storage/books/face/images/27245_69ec6ce07c447_1777102048.png',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrn5_W9N0qXv0HnQx-r45OVg-5A4w1tbZvTSX9XEhiaT-kO2aMpdpHw_f5&s=10',
  'https://hilolnashr.uz/image/cache/catalog/001-Kitoblar/003_boshqalar/002_badiy/2024/Otmishdan-ertaklar-web-550x550h.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVoIcIqK64Pa_QFAjR_eBBTAfOKwhQNp8M2zzrV-8y_r7_2tvWD1jZ2R0&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQY2arrrMq7qULfKrg8HIDtmHl_tBK9RgH9G4bn0sUH2DhIHQNCP0VxByo&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc3f20U5wiA3aG7JaPppQayCZ9vkbGI62m3IegN5_PwCUfgqYeZ4pVVMR-&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKC-7sj8NPce8LuMoyIsRZkV4LXdwMTKCiB7Ss7FQmdSXpvZvg2cS4Kw3H&s=10',
  'https://images.uzum.uz/d4ea5idv2sjnqk4hhki0/original.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScmn4V28_axFLiy7m9yYtHgRxrriuT1ns8NQ63UMP2IA&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5QdhhM28RxMVfLiuscqmr7BG3VJd2NO25arwa1InVXp_KuK_MYpF0ahM&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7uA4SOLBpsXM61PfXduFqlb0FR5ZYx0bgkFhCjuXUKQ&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSF8XRlWpv1ijKO7ospjokDnPuqnjeJlVemF6Qgo9i4cA&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3Y5r4u0W18AFxfYaP5oKvdMwsOiY5_pDFEue_8aMzj4uCxhUgTmewJUs&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUMaMSQrQbTHKa-CG0pZWLXTGIT0E25GIhrCSfOqI-9A&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZ0Ya0B9vVIQ8ZRkvDoz4N0uLRMvw--12jv04EDc9qSKxGxcHxVwW-EL7X&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD915B2GLt0onZ_V0a0Z5DSbrCsCYtxTzra8nUlYqfhw&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrGeHKopYmwE7JIFeXAxB7B3rnJKHoK4XxM3tZHvrFog&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQX2U78M5qVphiVlUyyJsiQC6mTR0WvaYFEAEDhR-1QM7Ha65ienmY8mZDj&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQStRUauABffA7xNaP6kPOFb47hfc38cg57g4VJN2IfCwbDJZPwJEMjaLXt&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5TDCOSdsuRoJt5WLl7RLSXNdDL22wm1OwO5OJv-UvOA&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTO2u6DSnfzkyUT2p7zK5MmzFyiLg8vBPDmHtvcp-hvgg&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWbWi2ITgsJzNpmea8ibmvdyHMjD86IsDvJe9ZQeqsro0i784OOTQNhZ4&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS811Y0FwGu7SJyJNHuuozcNBuY-9gHJDzbH0pKgB_aHCEb6k62XCjdqsQ&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTf-9VJp7NitRbqT7wO4YjeF7uMJKMFE6rsG0QESsFMu6Ey67q9TshwnI&s=10',
  'https://barakot.uz/image/get-image?imageName=Jinoyat%20va%20jazo%20(yangi)%20(%D0%905,%20yumshoq)%20768%20bet.jpg',
  'https://assets.asaxiy.uz/product/items/desktop/90f24d5ea7a107829d4c4992e50b695f2021032416453053021UQyeXq0TY4.jpg.webp',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUvdFED6esUz7CWKX7-AapK1TEFam0aCa-7kkPCNPo5eehP5_lYTeaBDU&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXH4AMR_c_tQ3aBrICxVug7ixukYJUG37KBvz3KNgNgworZQH2eqY7-i4&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpwvRlJfxb42U8RRxassh4fIaedx6gXkKAHT_BJLuguFvl57dIWAGL4O8&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsZ_o0RBpuEsZIu_IrWYiYMV2fPoVQUBUz2vvVgLGim936LSS0RPdkfYPR&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMR9JPlZJqvw4u9jP-dYxGfr-vzry7oAJhvCBJCpc0oKDFukxFYfaTuRbH&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5VhmnzOrpEPemyWhGffF8LSHZNsfZTLFzjfxjZUAsNyX_PjOF9GqwMwnh&s=10',
  'https://assets.asaxiy.uz/product/items/desktop/2a3d4b5f6d24e4a69eea672e889cecee2026020317294152256h4DGHHURpE.jpg.webp',
  'https://kitobxon.com/img_knigi/2795.jpg',
  'https://assets.asaxiy.uz/product/items/desktop/01894d6f048493d2cacde3c579c315a320210821173122339455O7fYBIUAy.jpg.webp',
  'https://kitobxon.com/img_knigi/2697.jpg',
  'https://akbt.urdu.uz/storage/books/face/images/25083_67eceb22ebd28_1743579938.jpg',
  'https://hilolnashr.uz/image/cache/catalog/badiiy_adabiyot/oz-yurtingdan-ayrilma-mto-web-550x550h.jpg',
  'https://kitobxon.com/img_knigi/1778.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTN65M9wxbt2Zj8ERGS-2WqqPcZviyMrzihYqX1q1UjRgCWxLIkD_i7KyLU&s=10',
  'https://mutolaa.com/_next/image?url=https%3A%2F%2Fcdn-minio.mutolaa.com%2Fmedia%2Fbooks%2F2024%2F03%2FNabi_Jaloliddin._Erkagi_bor_uy_hikoya.jpg&w=3840&q=75',
  'https://assets.asaxiy.uz/product/items/desktop/2629c29d3d4cb7da24935772b1f5e7012021042212330262676yVQ4gXMjfW.jpg.webp',
  'https://hilolnashr.uz/image/cache/catalog/boshqa-kitoblar/Robinzon_kruzo-500x750.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHV0SW6DOxKbX0RjYF0vz2LAjGx-wc_42ybQi3PBinB-xhB3RUG7BtA0Hm&s=10',
  'https://hilolnashr.uz/image/cache/catalog/bolalar/men-aldagan-hayot-500x750.jpg',
  'https://hilolnashr.uz/image/cache/catalog/saratonda-qor-yogdi-500x750.jpg',
  'https://s3.kuaf.uz/storage/lib_kuaf_uz/production/fiction-literature/img/38M2X3lETrn3ini3JieKmPzUxVWjX733UF4P62Ch.png',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWpaOdS-FTjMmXM3Y43LjZWj4svz7lmmEmI2_tk5wIqVZje9zmxwJBLW8&s=10',
  'https://kitobxon.com/img_knigi/2711.jpg',
  'https://images.uzum.uz/d7vds1s9g1ktqmll7hs0/original.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9OYyyUmxEhWWswmfF7ogdFneGQO3CubPwKsLpGFvQ4pQOlF-gEKFzZz5s&s=10',
  'https://assets.asaxiy.uz/product/items/desktop/f7177163c833dff4b38fc8d2872f1ec62023011316505439068LC4ds5LjJF.jpg.webp',
  'https://hilolnashr.uz/image/cache/catalog/badiiy_adabiyot/tilla-uzuk-mto-web-500x750.jpg',
  'https://hilolnashr.uz/image/cache/catalog/bolalar/ilinj-500x750.jpg',
  'https://hilolnashr.uz/image/cache/catalog/badiiy_adabiyot/aljabirning-tugilishi-mto-web-500x750.jpg',
  'https://hilolnashr.uz/image/cache/catalog/badiiy_adabiyot/adabiyot-muallimi-mto-web-500x750.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoDBWvjbyLpGNzdKNIbGDdZschuEPXlVfcXdtT-M_LTd5lu8o3h2N5GBE&s=10',
  'https://hilolnashr.uz/image/cache/catalog/bolalar/tinchlikni-uluglaymiz-500x750.jpg',
  'https://cdn-minio.mutolaa.com/media/books/2024/07/Andrey_Nekrasov._Kapitan_Vrungelning_sarguzashtlari_qissa.jpg',
  'https://assets.asaxiy.uz/product/items/desktop/7ebdeda72fcb98a781632099fe427b3f2025021814455075367CpDXG3kCPa.jpg.webp',
  'https://assets.asaxiy.uz/product/items/desktop/5e15bf0c223fc.jpg.webp',
  'https://kitobxon.com/img_knigi/1573.jpg',
  'https://assets.asaxiy.uz/product/items/desktop/5e15bc3d7d5e6.jpg.webp',
  'https://assets.asaxiy.uz/product/items/desktop/5e15bfe69887c.jpg.webp',
  'https://hilolnashr.uz/image/cache/catalog/boshqa-kitoblar/besh_bolali_yigitcha-500x750.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZilnaEllG7VfucR7OCP9vyM2G4ebdJpAm58WBM19_8rZHIHvzIuVQ0X4y&s=10',
  'https://assets.asaxiy.uz/product/items/desktop/934b535800b1cba8f96a5d72f72f16112023081402331181614dXnejjBAlE.jpg.webp',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEmIdPzJAiHXzE0wSSdgF-Y037_FOIewQnovbMwChg3Qo2tvK5ZLldQJk&s=10',
  'https://assets.asaxiy.uz/product/main_image/desktop/62224c086f1a9.jpg.webp',
  'https://kitobxon.com/img_knigi/2082.jpg',
  'https://assets.asaxiy.uz/product/items/desktop/26657d5ff9020d2abefe558796b995842023090411411487146mzDb5CgGyO.jpg.webp',
  'https://www.barakot.uz/image/get-image?imageName=Zumrad%20va%20Qimmat%201%20(%D0%905,%20qattiq).jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUNERStmAS0dsrLYoduAmlFgYtBQv_u_xM5xR0X8PA0_Zjne6tqlBqLEnO&s=10',
  'https://kitobxon.com/img_knigi/3761.jpg',
  'https://assets.asaxiy.uz/product/items/desktop/06715a8a5781105185c05b0e2d6830962023071318063178579NqRrxvQ7TY.jpg.webp',
  'https://kitobxon.com/img_knigi/2899.jpg',
  "https://hilolnashr.uz/image/cache/catalog/Tohir_Malik/ko'ngil-500x750.gif",
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgpn04pDl14v3sme3FbEnu7owXnZxzOaxeiEVHX_YqdGmFR61k6FmgXqI&s=10',
  'https://assets.asaxiy.uz/product/main_image/mobile/64dde2a0c9b9b.jpg.webp',
  "https://hilolnashr.uz/image/cache/catalog/001-Kitoblar/003_boshqalar/002_badiy/06.2025/o'limi-500x750.jpg",
  'https://hilolnashr.uz/image/cache/catalog/001-Kitoblar/003_boshqalar/003_bolalar/07.2025/jannati-500x750.jpg',
  'https://devel.prom.uz/upload/product_logos/a7/95/a79500748e2cf90dc7b3d426cfaeee3b.jpeg',
  'https://kitobxon.com/img_knigi/1648.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmvn97OLA4LX7O8ILSdTi6ip21eEwKbovKg8tVh6ZIgx5tQtNk7XsRBM4C&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWMaWP0rtH3Ic-rAjkwh8koKi-rzY8WIWa2x9aD2J-fQGjssSCAsI2H-4&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfwir-wwSdl4M7dYmWN9hnmxqggzaEt-hLbSvPtArx1TbINloTqTD5wC8&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxuS8axvGU77zSzQAT7-r90xC6Gz5KUjiTuLNXjDYAwxQ9B2tqcUrmkwKR&s=10',
  'https://assets.asaxiy.uz/product/items/desktop/01f0fd847a2c67093f3bf133ee2d6d9c2020112417074067113L4BMdKSahu.jpg.webp',
  'https://assets.asaxiy.uz/product/items/desktop/e4da3b7fbbce2345d7772b0674a318d52024041212195186223KfulhSkrtq.png.webp',
  'https://library.softly.uz/files/0270be47-da4c-4030-ae42-1d0694f2abf9.jpg',
  'https://assets.asaxiy.uz/product/items/desktop/8aec51422b30d61bce078b27f0babeb12022011820174152280vPNbAXEv1n.jpg.webp',
  'https://akbt.urdu.uz/storage/books/face/images/25078_67fca90ac045e_1744611594.jpg',
  'https://mutolaa.com/_next/image?url=https%3A%2F%2Fcdn-minio.mutolaa.com%2Fmedia%2Fbooks%2F2024%2F05%2FErkin_Vohidov.jpg&w=3840&q=75',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRD-nWZuzUQoQPorXapXupAMwnSYe5zgNM0xh2tpioyW0mP746o8GZH6EBD&s=10',
  'https://kitobxon.com/img_knigi/2698.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoOlArC6VXmhzFTI9hiqvuNUryXyxzxJVrNXknT641Wg&s=10',
  'https://kitobxon.com/img_knigi/2352.jpg',
  'https://hilolnashr.uz/image/cache/catalog/001-Kitoblar/003_boshqalar/002_badiy/2022/olmos-kamar-web-500x750.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9mcJZN55CEwIvhIrYg4JffTiYrh7GdhxdMX0P1PB1WQ3Fqhe263-1etEZ&s=10',
  'https://hilolnashr.uz/image/cache/catalog/bolalar/2018-02-08/buvamni-soginib-MTO-550x550h.jpg',
  'https://assets.asaxiy.uz/product/items/desktop/f9fe83f1ea3dd2108188fb7bf8aa5b3c202206161119523038006hGplwOQ7.jpg.webp',
  'https://cdn.asaxiy.uz/asaxiy-content/product/items/desktop/5e15c2429dd1f.jpg.webp',
  'https://assets.asaxiy.uz/product/items/desktop/8ebfe812c6b22e426f171f599b961d5920260712153544921799sWqm4qWxx.jpg.webp',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpzgdAbTZdz_2aUhUkzwJXiCjuGCsuw_kI7ZM0o9o82xRWQ2QT2FX43S3D&s=10',
  'https://kitobxon.com/img_knigi/3562.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNscdYohjArXPGebJitxpwE50GvGHaBqZfo5B4oWeRXfAANF27mjA5A_iq&s=10',
  'https://cdn-minio.mutolaa.com/media/books/2025/10/Pirimqul_Qodirov._Erk_qissa_.jpg',
  'https://main-cdn.sbermegamarket.ru/big1/hlr-system/1600268/100023267742b0.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSj1jmv8BlxMGA69jDI9Tzqh-zjeWT_weedtWXWBexBRpjxzpUXQUebJaY&s=10',
  'https://hilolnashr.uz/image/cache/catalog/badiiy_adabiyot/aloviddinning-sehirli-chirogi-mto-web-550x550h.jpg',
  'https://images.uzum.uz/ctfk8sj4nkds9ma0tj20/t_product_540_high.jpg',
  'https://kitobxon.com/img_knigi/3406.jpg',
  'https://barakot.com/image/get-image?imageName=Odil%20Hokim.jpg',
  'https://hilolnashr.uz/image/cache/catalog/bolalar/2018-02-08/yer-va-el-500x750.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTM78sLIRx17o5AsgEKXhtD6-Fx2JV3Xm9zraZTdzRe_pmAGSTowUQStge_&s=10',
];

const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const urlFor = (src) => COVERS.find((c) => c === src) ?? null;

/* URL-larda nomi ochiq yozilgan muqovalar uchun aniq moslash:
   title-normalized -> URL */
const MAPPING = {
  'abdulla qahhor o tmishdan ertaklar': 'https://hilolnashr.uz/image/cache/catalog/001-Kitoblar/003_boshqalar/002_badiy/2024/Otmishdan-ertaklar-web-550x550h.jpg',
  'jinoyat va jazo': 'https://barakot.uz/image/get-image?imageName=Jinoyat%20va%20jazo%20(yangi)%20(%D0%905,%20yumshoq)%20768%20bet.jpg',
  "o z yurtingdan ayrilma": "https://hilolnashr.uz/image/cache/catalog/badiiy_adabiyot/oz-yurtingdan-ayrilma-mto-web-550x550h.jpg",
  "erkagi bor uy": 'https://mutolaa.com/_next/image?url=https%3A%2F%2Fcdn-minio.mutolaa.com%2Fmedia%2Fbooks%2F2024%2F03%2FNabi_Jaloliddin._Erkagi_bor_uy_hikoya.jpg&w=3840&q=75',
  "robinzon kruzoning hayoti va sarguzashtlari": 'https://hilolnashr.uz/image/cache/catalog/boshqa-kitoblar/Robinzon_kruzo-500x750.jpg',
  "saratonda qor yog di": 'https://hilolnashr.uz/image/cache/catalog/saratonda-qor-yogdi-500x750.jpg',
  "besh bolali yigitcha": 'https://hilolnashr.uz/image/cache/catalog/boshqa-kitoblar/besh_bolali_yigitcha-500x750.jpg',
  "zumrat va qimmat": 'https://www.barakot.uz/image/get-image?imageName=Zumrad%20va%20Qimmat%201%20(%D0%905,%20qattiq).jpg',
  "ko ngil nimadan qorayadi": "https://hilolnashr.uz/image/cache/catalog/Tohir_Malik/ko'ngil-500x750.gif",
  "sariq devni o limi": "https://hilolnashr.uz/image/cache/catalog/001-Kitoblar/003_boshqalar/002_badiy/06.2025/o'limi-500x750.jpg",
  "jannati odamlar": 'https://hilolnashr.uz/image/cache/catalog/001-Kitoblar/003_boshqalar/003_bolalar/07.2025/jannati-500x750.jpg',
  "olmos kamar": 'https://hilolnashr.uz/image/cache/catalog/001-Kitoblar/003_boshqalar/002_badiy/2022/olmos-kamar-web-500x750.jpg',
  "buvamni sog inib": 'https://hilolnashr.uz/image/cache/catalog/bolalar/2018-02-08/buvamni-soginib-MTO-550x550h.jpg',
  "tilla uzuk": 'https://hilolnashr.uz/image/cache/catalog/badiiy_adabiyot/tilla-uzuk-mto-web-500x750.jpg',
  "ilinj": 'https://hilolnashr.uz/image/cache/catalog/bolalar/ilinj-500x750.jpg',
  "aljabrning tug ilishi": 'https://hilolnashr.uz/image/cache/catalog/badiiy_adabiyot/aljabirning-tugilishi-mto-web-500x750.jpg',
  "adabiyot muallimi": 'https://hilolnashr.uz/image/cache/catalog/badiiy_adabiyot/adabiyot-muallimi-mto-web-500x750.jpg',
  "tinchlikni ulug laymiz": 'https://hilolnashr.uz/image/cache/catalog/bolalar/tinchlikni-uluglaymiz-500x750.jpg',
  "kapitan vrungelning sarguzashtlari": 'https://cdn-minio.mutolaa.com/media/books/2024/07/Andrey_Nekrasov._Kapitan_Vrungelning_sarguzashtlari_qissa.jpg',
  "aloviddinning sehrli chirog i": 'https://hilolnashr.uz/image/cache/catalog/badiiy_adabiyot/aloviddinning-sehirli-chirogi-mto-web-550x550h.jpg',
  "odil hokim": 'https://barakot.com/image/get-image?imageName=Odil%20Hokim.jpg',
  "yer va el": 'https://hilolnashr.uz/image/cache/catalog/bolalar/2018-02-08/yer-va-el-500x750.jpg',
  "erk": 'https://cdn-minio.mutolaa.com/media/books/2025/10/Pirimqul_Qodirov._Erk_qissa_.jpg',
};

async function api(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${body.slice(0, 200)}`);
  }
  return res.status === 204 ? null : res.json();
}

async function main() {
  const dryRun = process.argv.includes('--dry');
  const books = await api('/books');
  console.log(`Jami kitoblar: ${books.length}, muqova URL: ${COVERS.length}`);

  const used = new Set();
  const coverById = new Map();

  books.forEach((b) => coverById.set(b.id, { id: b.id, title: b.title, cover: null, method: null }));

  /* 1-pass: URL dan ishonchli aniqlangan kitoblar birinchi o'z muqovasini oladi */
  let found = 0;
  for (const book of books) {
    const mappedUrl = MAPPING[norm(book.title)];
    if (mappedUrl) {
      const rec = coverById.get(book.id);
      rec.cover = mappedUrl;
      rec.method = 'identified';
      used.add(mappedUrl);
      found++;
    }
  }

  /* 2-pass: qolgan kitoblarga qolgan URL lar ketma-ket beriladi
     (muqovasi ALLAQACHON bor bo'lganlar saqlanib qoladi) */
  let fallback = 0;
  const covered = new Set([...coverById.values()].filter((r) => r.cover).map((r) => r.id));
  for (const b of books) {
    if (covered.has(b.id)) continue;
    if (coverById.get(b.id).cover) continue;
    if (b.coverImage) continue;
    const next = COVERS.find((c) => !used.has(c));
    if (!next) break;
    const rec = coverById.get(b.id);
    rec.cover = next;
    rec.method = 'fallback';
    used.add(next);
    fallback++;
  }

  const assigned = [...coverById.values()];
  const missing = assigned.filter((a) => !a.cover);
  const already = books.filter((b) => b.coverImage && !MAPPING[norm(b.title)]).map((b) => b.id);
  console.log(`Identified: ${found}, fallback(ketma-ket): ${fallback}, allaqachon muqovasi bor: ${already.length}`);
  console.log(`Muqovasiz qolgan: ${missing.length}`);

  for (const a of assigned.filter((x) => x.cover)) {
    const tag = a.method === 'identified' ? '  [identified]' : '';
    console.log(`${String(a.id).padEnd(12)} ${a.title.padEnd(45)} -> ${a.cover.slice(0, 60)}${tag}`);
  }

  if (missing.length) {
    console.log('\n--- Muqovasiz kitoblar ---');
    for (const m of missing) console.log(`${m.id} ${m.title}`);
  }

  if (dryRun) {
    console.log('\nDRY RUN — hech narsa saqlanmadi.');
    return;
  }

  let ok = 0;
  for (const a of assigned.filter((x) => x.cover)) {
    try {
      await api(`/books/${a.id}`, { method: 'PATCH', body: JSON.stringify({ coverImage: a.cover }) });
      ok++;
    } catch (e) {
      console.error(`PATCH ${a.id} xato: ${e.message}`);
    }
  }
  console.log(`\nSaqlangan: ${ok}/${assigned.filter((x) => x.cover).length}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});