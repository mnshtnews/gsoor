#!/usr/bin/env python3
"""Build the offline geography catalog; see docs/GEOGRAPHY_CATALOG_DATA.md."""
from __future__ import annotations
import io, json, re, tempfile, urllib.request, zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUTPUT=ROOT/'backend/src/Jusoor.Infrastructure/Persistence/Data/geography-catalog.json'
DIASPORA_COUNTRIES="US GB IT DE CA AU FR NL GR AT CH SE BE IE ES ZA BR TR CY RU JP MY ID CN NZ DK NO PT PL UA SG KR IN PK NG ET KE GH SN CI AR MX TH BD PH RO FI LU IR UY".split()
NON_ARAB_NAMES={"US":"الولايات المتحدة","GB":"المملكة المتحدة","IT":"إيطاليا","DE":"ألمانيا","CA":"كندا","AU":"أستراليا","FR":"فرنسا","NL":"هولندا","GR":"اليونان","AT":"النمسا","CH":"سويسرا","SE":"السويد","BE":"بلجيكا","IE":"أيرلندا","ES":"إسبانيا","ZA":"جنوب أفريقيا","BR":"البرازيل","TR":"تركيا","CY":"قبرص","RU":"روسيا","JP":"اليابان","MY":"ماليزيا","ID":"إندونيسيا","CN":"الصين","NZ":"نيوزيلندا","DK":"الدنمارك","NO":"النرويج","PT":"البرتغال","PL":"بولندا","UA":"أوكرانيا","SG":"سنغافورة","KR":"كوريا الجنوبية","IN":"الهند","PK":"باكستان","NG":"نيجيريا","ET":"إثيوبيا","KE":"كينيا","GH":"غانا","SN":"السنغال","CI":"ساحل العاج","AR":"الأرجنتين","MX":"المكسيك","TH":"تايلاند","BD":"بنغلاديش","PH":"الفلبين","RO":"رومانيا","FI":"فنلندا","LU":"لوكسمبورغ","IR":"إيران","UY":"أوروغواي"}
ARAB_COUNTRIES={"DZ":"الجزائر","BH":"البحرين","KM":"جزر القمر","DJ":"جيبوتي","EG":"مصر","IQ":"العراق","JO":"الأردن","KW":"الكويت","LB":"لبنان","LY":"ليبيا","MR":"موريتانيا","MA":"المغرب","OM":"عُمان","PS":"فلسطين","QA":"قطر","SA":"السعودية","SO":"الصومال","SD":"السودان","SY":"سوريا","TN":"تونس","AE":"الإمارات العربية المتحدة","YE":"اليمن"}
CITY_URL='https://download.geonames.org/export/dump/cities5000.zip'
COUNTRY_URL='https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson'
COUNTRY_NAMES_URL='https://download.geonames.org/export/dump/countryInfo.txt'
MANUAL_CITY_NAMES={'BH':{'Manama':'المنامة','Al Muharraq':'المحرق','Ar Rifa':'الرفاع','Ar Rifā‘':'الرفاع','Madīnat ‘Īsá':'مدينة عيسى','Madīnat Ḩamad':'مدينة حمد','Sitrah':'سترة','Dār Kulayb':'دار كليب','Al Ḩadd':'الحد','Jidd Ḩafş':'جد حفص','Az Zallāq':'الزلاق','Saar':'سار'},'KM':{'Moroni':'موروني','Mutsamudou':'موتسامودو','Fomboni':'فومبوني','Domoni':'دوموني','Ouani':'أواني','Sima':'سيما','Tsimbeo':'صيمبيهو'},'SG':{'Singapore':'سنغافورة'}}
CANONICAL_CITY_NAMES={
('US','Los Angeles'):'لوس أنجلوس',('US','Houston'):'هيوستن',('US','Philadelphia'):'فيلادلفيا',('US','San Antonio'):'سان أنطونيو',
('GB','London'):'لندن',('GB','Birmingham'):'برمنغهام',('GB','Sheffield'):'شيفيلد',('GB','Leeds'):'ليدز',('GB','Edinburgh'):'إدنبرة',
('DE','Berlin'):'برلين',('DE','Hamburg'):'هامبورغ',('DE','Munich'):'ميونخ',('DE','Essen'):'إيسن',
('CA','Toronto'):'تورونتو',('CA','Montréal'):'مونتريال',('CA','Ottawa'):'أوتاوا',
('AU','Sydney'):'سيدني',('AU','Melbourne'):'ملبورن',('AU','Brisbane'):'بريزبن',('AU','Adelaide'):'أديلايد',
('NL','Amsterdam'):'أمستردام',('NL','Utrecht'):'أوتريخت',('CH','Zürich'):'زيورخ',('CH','Geneva'):'جنيف',('CH','Basel'):'بازل',
('BE','Antwerp'):'أنتويرب',('ES','Madrid'):'مدريد',('ES','Barcelona'):'برشلونة',('ES','Valencia'):'فالنسيا',('ES','Sevilla'):'إشبيلية',
('TR','Istanbul'):'إسطنبول',('TR','Ankara'):'أنقرة',('RU','Moscow'):'موسكو',('ID','Surabaya'):'سورابايا',('NZ','Auckland'):'أوكلاند',
('PT','Lisbon'):'لشبونة',('PL','Warsaw'):'وارسو',('UA','Kyiv'):'كييف',('KR','Seoul'):'سيول',('IN','Mumbai'):'مومباي',
('IN','Delhi'):'نيودلهي',('IN','Bengaluru'):'بنغالورو',('IN','Hyderabad'):'حيدر آباد',('IN','Chennai'):'تشيناي',
('PK','Lahore'):'لاهور',('PK','Karachi'):'كراتشي',('PK','Peshawar'):'بيشاور',('NG','Lagos'):'لاغوس',('KE','Nairobi'):'نيروبي',
('KE','Mombasa'):'ممباسا',('GH','Accra'):'أكرا',('SN','Dakar'):'داكار',('AR','Buenos Aires'):'بوينس آيرس',
('TH','Bangkok'):'بانكوك',('BD','Dhaka'):'دكا',('PH','Manila'):'مانيلا',('PH','Cebu City'):'سيبو',('IR','Tehran'):'طهران',
('UY','Montevideo'):'مونتيفيديو',('DZ','Algiers'):'الجزائر',('DZ','Oran'):'وهران',('DZ','Constantine'):'قسنطينة',
('BH','Manama'):'المنامة',('BH','Al Muharraq'):'المحرق',('JO','Amman'):'عمان',('LB','Beirut'):'بيروت',
('LB','Tripoli'):'طرابلس الشام',('LY','Tripoli'):'طرابلس',('MA','Casablanca'):'الدار البيضاء',('MA','Tangier'):'طنجة',
('MA','Agadir'):'أكادير',('SA','Jeddah'):'جدة',('SA','Madinah'):'المدينة المنورة',('SO','Mogadishu'):'مقديشو',
('SD','Khartoum'):'الخرطوم',('SD','Omdurman'):'أم درمان',('SY','Damascus'):'دمشق',('SY','Homs'):'حمص',
('TN','Tunis'):'تونس',('AE','Dubai'):'دبي',('AE','Abu Dhabi'):'أبوظبي',('AE','Sharjah'):'الشارقة',
('PS','Gaza'):'غزة',('PS','Hebron'):'الخليل',('PS','Nablus'):'نابلس',('PS','East Jerusalem'):'القدس الشرقية',
}
ARABIC=re.compile(r'[\u0600-\u06ff]')
NON_ARABIC_VARIANT=set('پچژگکڭڱںھہۀۃۂټډړځڤۏۍېۆەی')
DIACRITICS=re.compile(r'[\u064b-\u065f\u0670\u0640]')
def download(url):
 req=urllib.request.Request(url,headers={'User-Agent':'JusoorGeographyCatalog/1.0'})
 with urllib.request.urlopen(req,timeout=60) as response:return response.read()
def arabic_alias(aliases):
 candidates=[]
 for value in aliases.split(','):
  value=' '.join(value.split()).strip(' -–—,.;')
  if not value or not ARABIC.search(value) or any(ch in NON_ARABIC_VARIANT for ch in value):continue
  if any(ch.isascii() and ch.isalpha() for ch in value):continue
  normalized=DIACRITICS.sub('',value)
  if not normalized or not re.fullmatch(r"[\u0600-\u06ff\s'’.-]+",normalized):continue
  candidates.append(((int(normalized==value),len(normalized),-value.count(' ')),normalized))
 return max(candidates,default=(None,None))[1]
def slugify(value):
 value=value.lower().replace('&',' and ').encode('ascii','ignore').decode('ascii')
 return re.sub(r'[^a-z0-9]+','-',value).strip('-') or 'location'
def main():
 codes=list(dict.fromkeys(DIASPORA_COUNTRIES+list(ARAB_COUNTRIES)))
 if len(DIASPORA_COUNTRIES)!=50:raise SystemExit(f'Expected 50 diaspora destinations, found {len(DIASPORA_COUNTRIES)}')
 with tempfile.TemporaryDirectory(prefix='.geography-generator-',dir=ROOT) as temp:
  city_archive=Path(temp)/'cities5000.zip';city_archive.write_bytes(download(CITY_URL))
  country_names={};iso3_to_code={}
  for line in download(COUNTRY_NAMES_URL).decode('utf-8').splitlines():
   if line.startswith('#') or not line.strip():continue
   fields=line.split('\t')
   if len(fields)>4:country_names[fields[0]]=fields[4];iso3_to_code[fields[1]]=fields[0]
  cities={code:[] for code in codes}
  with zipfile.ZipFile(city_archive) as archive:
   with io.TextIOWrapper(archive.open('cities5000.txt'),encoding='utf-8') as source:
    for line in source:
     f=line.rstrip('\n').split('\t');code=f[8]
     if code not in cities or not f[7].startswith('P'):continue
     ar=CANONICAL_CITY_NAMES.get((code,f[1])) or arabic_alias(f[3]) or MANUAL_CITY_NAMES.get(code,{}).get(f[1])
     if not ar:continue
     cities[code].append({'nameAr':ar,'nameEn':f[1],'slug':slugify(f[2]),'latitude':round(float(f[4]),6),'longitude':round(float(f[5]),6),'population':int(f[14] or 0),'geonamesId':int(f[0])})
  natural=json.loads(download(COUNTRY_URL));points={}
  for feature in natural['features']:
   p=feature['properties'];code=p.get('ISO_A2_EH') or p.get('ISO_A2')
   if code not in codes:code=iso3_to_code.get(p.get('ADM0_A3') or p.get('ISO_A3_EH') or p.get('ISO_A3'))
   if code in codes and p.get('LABEL_X') is not None and p.get('LABEL_Y') is not None:points[code]=(round(float(p['LABEL_Y']),6),round(float(p['LABEL_X']),6))
  records=[];missing=[]
  for code in codes:
   choices=sorted(cities[code],key=lambda x:(-x['population'],x['nameEn'].casefold()));selected=choices[:12 if code in ARAB_COUNTRIES else 8];seen=set()
   for city in selected:
    if city['slug'] in seen:city['slug']=f"{city['slug']}-{city['geonamesId']}"
    seen.add(city['slug'])
   point=points.get(code)
   if not point and selected:point=(selected[0]['latitude'],selected[0]['longitude'])
   if not point or not selected:missing.append(code);continue
   records.append({'isoCode2':code,'nameAr':ARAB_COUNTRIES.get(code) or NON_ARAB_NAMES.get(code),'nameEn':country_names.get(code),'slug':code.lower(),'latitude':point[0],'longitude':point[1],'cities':selected})
 if missing:raise SystemExit('Missing a country point or Arabic city alias for: '+', '.join(missing))
 OUTPUT.parent.mkdir(parents=True,exist_ok=True);OUTPUT.write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(f"Wrote {len(records)} countries and {sum(len(x['cities']) for x in records)} cities to {OUTPUT}")
if __name__=='__main__':main()












