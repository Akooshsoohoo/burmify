// Shared sample data for both directions. Pared down from the real
// vocabulary.json for prototype purposes.
window.BURMIFY_DATA = {
  categories: [
    { id: 'greetings', label: 'Greetings & Basics',  desc: 'Hellos, thanks, polite phrases',     wordCount: 24, done: 18, sample: 'မင်္ဂလာပါ' },
    { id: 'questions', label: 'Questions',           desc: 'What, where, when, why',              wordCount: 8,  done: 8,  sample: 'ဘာလဲ' },
    { id: 'food',      label: 'Food & Restaurant',   desc: 'Ordering food and dining',            wordCount: 11, done: 4,  sample: 'ထမင်း' },
    { id: 'travel',    label: 'Travel & Directions', desc: 'Getting around the city',             wordCount: 12, done: 0,  sample: 'ဘယ်မှာ' },
    { id: 'numbers',   label: 'Numbers',             desc: 'One through one hundred',             wordCount: 20, done: 0,  sample: 'တစ်' },
    { id: 'family',    label: 'Family & People',     desc: 'Mother, father, friend, neighbor',    wordCount: 14, done: 0,  sample: 'အမေ' },
  ],
  words: [
    { id: 'mingalaba',  burmese: 'မင်္ဂလာပါ',         roman: 'mingalaba',          en: 'hello' },
    { id: 'thankyou',   burmese: 'ကျေးဇူးတင်ပါတယ်',  roman: 'kyeizu tin ba deh',  en: 'thank you' },
    { id: 'goodbye',    burmese: 'သွားတော့မယ်',      roman: 'thwa dot meh',       en: 'goodbye' },
    { id: 'sorry',      burmese: 'ဆောရီး',           roman: 'sorry',              en: 'sorry' },
    { id: 'yes',        burmese: 'ဟုတ်ကဲ့',          roman: 'hote keh',           en: 'yes' },
    { id: 'no',         burmese: 'မဟုတ်ဘူး',         roman: 'ma hote bu',         en: 'no' },
    { id: 'water',      burmese: 'ရေ',                roman: 'yay',                en: 'water' },
    { id: 'rice',       burmese: 'ထမင်း',             roman: 'hta min',            en: 'rice' },
    { id: 'tea',        burmese: 'လက်ဖက်ရည်',         roman: 'lahpet yay',         en: 'tea' },
    { id: 'where',      burmese: 'ဘယ်မှာလဲ',          roman: 'beh hma leh',        en: 'where?' },
    { id: 'what',       burmese: 'ဘာလဲ',              roman: 'ba leh',             en: 'what?' },
    { id: 'how',        burmese: 'ဘယ်လိုလဲ',          roman: 'beh lo leh',         en: 'how?' },
    { id: 'hungry',     burmese: 'ဗိုက်ဆာတယ်',        roman: 'bite sar deh',       en: 'I am hungry' },
    { id: 'delicious',  burmese: 'အရမ်းကောင်းတယ်',    roman: 'a yan kaung deh',    en: 'delicious' },
  ],
  sentence: {
    burmese: ['ကျွန်တော်', 'ရေ', 'သောက်ချင်တယ်'],
    gloss:   ['I',           '___', 'want to drink'],
    answer:  'ရေ',
    options: ['ထမင်း', 'ရေ', 'လက်ဖက်ရည်', 'ဆား'],
    optionsEn: ['rice', 'water', 'tea', 'salt'],
    fullEn: 'I want to drink water.',
  },
};
