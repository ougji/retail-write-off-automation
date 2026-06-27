export type WriteOffStatus = "pending" | "approved" | "rejected"
export type WriteOffType = "no_deduction" | "with_deduction"
export type UserRole = "employee" | "reviewer"

export interface WriteOff {
  id: string
  employee_id: string
  employee_name: string
  store_location: string
  photo: string | null
  write_off_type: WriteOffType
  deduct_employee: string | null
  comment: string
  status: WriteOffStatus
  reviewer_id: string | null
  reviewed_at: string | null
  created_at: string
}

export interface Store {
  id: string
  name: string
  address: string
  city: string
}

export const STORES: Store[] = [
  { id: "01288a12", name: "Bahandi Шахтеров", address: "проспект Шахтеров, 82/3 (киоск)", city: "Караганда" },
  { id: "0346d7ef", name: "Bahandi Магнум Жетысу", address: "Жетысу-3 микрорайон, 1г/3 (киоск)", city: "Алматы" },
  { id: "0520b820", name: "Bahandi АДК", address: "ул. Каныша Сатпаева, 90/21 (ТРЦ Riviera Park)", city: "Алматы" },
  { id: "05cf8b81", name: "Bahandi Сары Арка", address: "4-й микрорайон, 28/1 (рынок Сары Арка)", city: "Алматы" },
  { id: "05d95ea5", name: "Bahandi Март", address: "проспект Аль-Фараби, 48 (ТРЦ MART, 3 этаж)", city: "Костанай" },
  { id: "0666a949", name: "Bahandi Каменка", address: "ул. Керуентау, 2/1 (1 этаж)", city: "Алматы" },
  { id: "091e5399", name: "Bahandi Астана Молл", address: "проспект Тауелсиздик, 34/7 (киоск)", city: "Астана" },
  { id: "09d792a8", name: "Bahandi Магнум Акбулак", address: "Акбулак микрорайон, ул. Байтерекова, 6/1 (1 этаж)", city: "Алматы" },
  { id: "0a4d2b0a", name: "Bahandi Форум", address: "проспект Сейфуллина, 617 (киоск)", city: "Алматы" },
  { id: "0d61770f", name: "Bahandi Орбита", address: "микрорайон Орбита-3, ул. Мустафина, 5Б/1 (киоск)", city: "Алматы" },
  { id: "126d308d", name: "Bahandi Север", address: "ул. Рыскулова, 49а (ТЦ Север, 1 этаж)", city: "Шымкент" },
  { id: "1586e598", name: "Bahandi Спутник", address: "Мамыр-1 микрорайон, 8а (ТРЦ SPUTNIK mall, 3 этаж)", city: "Алматы" },
  { id: "1627e81f", name: "Bahandi Грин Плаза", address: "17-й микрорайон, 6 (ЖК Green Plaza)", city: "Актау" },
  { id: "16bc1a5a", name: "Bahandi Апорт Кульджинка", address: "Кульджинский тракт, 106 (ТРЦ Aport Mall East)", city: "Алматы" },
  { id: "1f0c4421", name: "Bahandi Каскелен", address: "г. Каскелен, ул. Абен Омиралы, 99", city: "Алматы" },
  { id: "21546be9", name: "Bahandi Даму Молл", address: "ул. Жумекен Нажимеденов, 26 (ТРЦ Damu Mall, 2 этаж)", city: "Астана" },
  { id: "290072da", name: "Bahandi Магнум Гагарина", address: "проспект Гагарина, 41 (1 этаж)", city: "Алматы" },
  { id: "2af7a6e5", name: "Bahandi Тумар", address: "ул. Сыганак, 1Б/2 (киоск)", city: "Астана" },
  { id: "2b9862e6", name: "Bahandi Татарка", address: "ул. Оренбургская, 2 (1 этаж)", city: "Алматы" },
  { id: "2d04ea89", name: "Bahandi Масанчи", address: "ул. Масанчи, 96 (цокольный этаж)", city: "Алматы" },
  { id: "2e311225", name: "Bahandi Строителей", address: "проспект Строителей, 35 (киоск)", city: "Караганда" },
  { id: "30aabaac", name: "Bahandi Март Тараз", address: "проспект Толе би, 27 (ТРЦ Mart, 3 этаж)", city: "Тараз" },
  { id: "31cdbbc6", name: "Bahandi Жибек Жолы", address: "ул. Ахмета Байтурсынова, 34 (ТРЦ Жибек Жолы, 3 этаж)", city: "Астана" },
  { id: "36280240", name: "Bahandi Мега Центр Розыбакиева", address: "ул. Розыбакиева, 247а (ТРЦ Mega Center Alma-Ata)", city: "Алматы" },
  { id: "3a3f669f", name: "Bahandi Атакент", address: "ул. Ауэзова, 140 (1 этаж)", city: "Алматы" },
  { id: "3cd26232", name: "Bahandi ЦУМ", address: "проспект Абылай хана, 62 (ТД ЦУМ, 1 этаж)", city: "Алматы" },
  { id: "3d67efd1", name: "Bahandi Керемет", address: "ул. Байтурсынова, 81 (1 этаж)", city: "Шымкент" },
  { id: "429e4f15", name: "Bahandi Масато", address: "ул. Ораза Жандосова, 162а", city: "Алматы" },
  { id: "43361d3e", name: "Bahandi Жубанова", address: "Аксай-4 микрорайон, 22а/3 (киоск)", city: "Алматы" },
  { id: "4a639d2e", name: "Bahandi Дружба", address: "ул. Шамгона Кажыгалиева, 22", city: "Алматы" },
  { id: "4be2b7c3", name: "Bahandi Бесагаш", address: "с. Бесагаш, ул. Райымбек батыра, 250/1 (киоск)", city: "Алматы" },
  { id: "5314ed3f", name: "Bahandi ГРЭС", address: "с. Отеген Батыра, ул. Жансугурова, 15а", city: "Алматы" },
  { id: "545af44c", name: "Bahandi Кунаева", address: "Абая проспект, 27 (киоск)", city: "Алматы" },
  { id: "54747b1a", name: "Bahandi Мангилик Ел", address: "проспект Мангилик Ел, 56 (ЖК Only Sun)", city: "Астана" },
  { id: "557d8f41", name: "Bahandi Талгар", address: "г. Талгар, ул. Кунаева, 140", city: "Алматы" },
  { id: "560503cb", name: "Bahandi Торнадо", address: "микрорайон 3-й, 20а (1 этаж)", city: "Алматы" },
  { id: "5fe574f5", name: "Bahandi ВАЗ", address: "ул. Тукая, 28 (1 этаж)", city: "Алматы" },
  { id: "6146ad85", name: "Bahandi Женис", address: "проспект Женис, 28а (киоск)", city: "Астана" },
  { id: "6dbdb4be", name: "Bahandi Сити Молл", address: "проспект Байдибек би, 362/7 (ТРЦ Shymkent City Mall, 3 этаж)", city: "Шымкент" },
  { id: "6de55883", name: "Bahandi Азия Парк", address: "проспект Райымбека, 514а (ТРК Asia Park, 3 этаж)", city: "Алматы" },
  { id: "75c3c721", name: "Bahandi Апорт", address: "Ташкентский тракт, 17к (ТРЦ Молл Апорт, 2 этаж)", city: "Алматы" },
  { id: "7c724281", name: "Bahandi Даймонд Плаза", address: "проспект Нурсултана Назарбаева, 177Б (ТРК Diamond plaza, 4 этаж)", city: "Шымкент" },
  { id: "816344dc", name: "Bahandi Байтурсынова", address: "ул. Байтурсынова, 61 (1 этаж)", city: "Алматы" },
  { id: "820ee7d8", name: "Bahandi ЦУМ Кар", address: "проспект Бухар Жырау, 53/8 (ТЦ ЦУМ, 3 этаж)", city: "Караганда" },
  { id: "82e58b56", name: "Bahandi Гагарина", address: "проспект Гагарина, 41 (1 этаж)", city: "Алматы" },
  { id: "8ba0316b", name: "Bahandi Дала Молл", address: "Алматинская трасса, 13а (ТЦ Dala Mall, 2 этаж)", city: "Шымкент" },
  { id: "8c3a9781", name: "Bahandi Магнум Бесагаш", address: "Медеуский район, ул. Халиуллина, 194/3 (киоск)", city: "Алматы" },
  { id: "9c56e8db", name: "Bahandi Гульжан", address: "микрорайон Степной-1, 5/8 (киоск)", city: "Караганда" },
  { id: "9cf79be3", name: "Bahandi Сая Парк", address: "10-й микрорайон, 3 (ТЦ Saya Park, 2 этаж)", city: "Актау" },
  { id: "9f4a2aa3", name: "Bahandi Капчагай", address: "г. Конаев, Алматинская улица, 64а (киоск)", city: "Алматы" },
  { id: "a1ef5898", name: "Bahandi Чубары", address: "ул. Темирказык, 2Б (м-н Шубар, киоск)", city: "Астана" },
  { id: "a26e3db9", name: "Bahandi Хан Шатыр", address: "проспект Туран, 37 (ТРЦ Хан Шатыр, 3 этаж)", city: "Астана" },
  { id: "a4d5959a", name: "Bahandi Юбилейный", address: "проспект Нуркена Абдирова, 38 (киоск)", city: "Караганда" },
  { id: "a7583e5d", name: "Bahandi Акжар", address: "Жандосова 254/9", city: "Алматы" },
  { id: "ae5a2094", name: "Bahandi Рио", address: "ул. Полины Осипенко, 1 (ТРЦ РИО, 4 этаж)", city: "Кокшетау" },
  { id: "af2f7cf3", name: "Bahandi Аружан", address: "ул. Илияса Жансугурова, 8/1 (ТРЦ Аружан, 3 этаж)", city: "Астана" },
  { id: "b06266ec", name: "Bahandi Магнум Туран", address: "проспект Туран, 55д (киоск)", city: "Астана" },
  { id: "b135f0b3", name: "Bahandi Далида Сити", address: "проспект Алии Молдагуловой, 72а (ТРЦ Dalida Plaza, 2 этаж)", city: "Актобе" },
  { id: "b148c7c1", name: "Bahandi Ритц Палас", address: "Самал-3 микрорайон, 2а (киоск)", city: "Алматы" },
  { id: "b150cb36", name: "Bahandi Янги Шахар", address: "Тамерлановское шоссе, 1а/8 (киоск)", city: "Шымкент" },
  { id: "b6482714", name: "Bahandi Жаркент", address: "Панфиловский р-н, г. Жаркент, ул. Юлдашева, 7а (киоск)", city: "Алматы" },
  { id: "b67b4c4c", name: "Bahandi Таукехана", address: "проспект Тауке хана, 112 (киоск)", city: "Шымкент" },
  { id: "be978c57", name: "Bahandi Роял Плаза", address: "ул. Рыскулова, 8а/5 (ТРЦ Royal Plaza)", city: "Шымкент" },
  { id: "c29aba41", name: "Bahandi Петрова", address: "ул. Алексея Петрова, 22г (1 этаж)", city: "Астана" },
  { id: "c9efba51", name: "Bahandi Мерей", address: "проспект Суюнбая, 2/Б (киоск)", city: "Алматы" },
  { id: "cf3c0341", name: "Bahandi Тастак", address: "Тастак-3 микрорайон, ул. Толе би, 229/3 (киоск)", city: "Алматы" },
  { id: "d0c94f03", name: "Bahandi Весновка", address: "Коктем-2 микрорайон, 22 (киоск)", city: "Алматы" },
  { id: "d0f64f5a", name: "Bahandi Айнабулак", address: "Айнабулак 2 микрорайон, 82/4 (киоск)", city: "Алматы" },
  { id: "d3330502", name: "Bahandi Глобус Фудкорт", address: "Абая проспект, 109в (ТРЦ Globus, 2 этаж)", city: "Алматы" },
  { id: "d3d09933", name: "Bahandi Динара", address: "проспект Республики, 40/1 (1 этаж)", city: "Шымкент" },
  { id: "d573a36a", name: "Bahandi Мега SilkWay", address: "проспект Кабанбай батыр, 62 (ТРЦ Мега SilkWay, 2 этаж)", city: "Астана" },
  { id: "d717234c", name: "Bahandi Иманова", address: "ул. Аменгельды Иманова, 3 (киоск)", city: "Астана" },
  { id: "d8db3516", name: "Bahandi Макси Молл", address: "проспект Каныша Сатпаева, 51 (ТРЦ Maxi Mall, 2 этаж)", city: "Усть-Каменогорск" },
  { id: "d8e44494", name: "Bahandi Максима", address: "проспект Райымбека, 239г (ТРК Maxima, 3 этаж)", city: "Алматы" },
  { id: "d9887f01", name: "Bahandi Магнум Аксуат", address: "ул. Аксуат, 128/2 (киоск)", city: "Алматы" },
  { id: "dd38a362", name: "Bahandi Мега Парк Сейфуллина", address: "ул. Макатаева, 127/1 (ТРК MEGA Park, 3 этаж)", city: "Алматы" },
  { id: "dd608729", name: "Bahandi Шолохова", address: "ул. Шолохова, 8 (киоск)", city: "Алматы" },
  { id: "e2408142", name: "Bahandi АДК Ривер", address: "ул. Казахстан, 62 (ТРК ADK River, 3 этаж)", city: "Усть-Каменогорск" },
  { id: "e25991e7", name: "Bahandi Байзаар", address: "ул. Бактыгерея Кулманова, 111а (ТРЦ Baizaar, 3 этаж)", city: "Атырау" },
  { id: "e47a58f6", name: "Bahandi Инфинити Молл", address: "проспект Каныша Сатпаева, 43а (ТРЦ Infinity Mall, 3 этаж)", city: "Атырау" },
  { id: "e738f41d", name: "Bahandi Азия Парк", address: "проспект Кабанбай батыра, 21 (ТРЦ Asia Park, 3 этаж)", city: "Астана" },
  { id: "e8d327f6", name: "Bahandi Жумалиева", address: "ул. Толе би, 147 (1 этаж)", city: "Алматы" },
  { id: "eda43925", name: "Bahandi Магнум Кошкарбаева", address: "ул. Едил, 26", city: "Астана" },
  { id: "f2d2a191", name: "Bahandi Джангильдина", address: "ул. Демьяна Бедного, 3/2 (киоск)", city: "Алматы" },
  { id: "f5a1ead3", name: "Bahandi Панфилова", address: "ул. Панфилова, 110 (киоск)", city: "Алматы" },
  { id: "f742b8ab", name: "Bahandi Водник", address: "ул. Алатау, 2д, пос. Боралдай (Рынок Алатау)", city: "Алматы" },
  { id: "f9c7ed24", name: "Bahandi Белинского", address: "ул. Ильяса Жансугурова, 258 (киоск)", city: "Алматы" },
]

export const STORE_LOCATIONS = STORES.map((s) => s.name)
