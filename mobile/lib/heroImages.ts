// Curated, iconic hero photo per destination (Wikimedia, 1280px). Used directly
// so images are beautiful and load fast/reliably rather than guessed at runtime.
export const HERO_IMAGES: Record<string, string> = {
  Beijing:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Great_Wall_of_China_July_2006.JPG/1280px-Great_Wall_of_China_July_2006.JPG",
  Chengdu:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Grosser_Panda.JPG/1280px-Grosser_Panda.JPG",
  Chongqing:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/202308_Hongya_Cave_at_night_from_Qiansimen_Bridge.jpg/1280px-202308_Hongya_Cave_at_night_from_Qiansimen_Bridge.jpg",
  Zhangjiajie:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/1_tianzishan_wulingyuan_zhangjiajie_2012.jpg/1280px-1_tianzishan_wulingyuan_zhangjiajie_2012.jpg",
  Shanghai:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/The_Bund_2.jpg/1280px-The_Bund_2.jpg",
  Taipei:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Taipei_Skyline_2022.06.29.jpg/1280px-Taipei_Skyline_2022.06.29.jpg",
  "Hong Kong":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Hong_Kong_Skyline_viewed_from_Victoria_Peak.jpg/1280px-Hong_Kong_Skyline_viewed_from_Victoria_Peak.jpg",
};

export function heroImageFor(mapcity: string): string | undefined {
  return HERO_IMAGES[mapcity];
}
