export interface Person {
  id: string
  name: string
  position: string
}

// Mock roster of employees who can be marked responsible for a deduction.
export const PEOPLE: Person[] = [
  { id: "p-01", name: "Алия Нурланова", position: "Кассир" },
  { id: "p-02", name: "Данияр Серіков", position: "Повар" },
  { id: "p-03", name: "Жанна Әбенова", position: "Бариста" },
  { id: "p-04", name: "Тимур Қайратұлы", position: "Кассир" },
  { id: "p-05", name: "Мадина Оспанова", position: "Администратор смены" },
  { id: "p-06", name: "Ерлан Тулегенов", position: "Повар" },
  { id: "p-07", name: "Айгерім Сейтова", position: "Бариста" },
  { id: "p-08", name: "Нурлан Бектұров", position: "Кладовщик" },
  { id: "p-09", name: "Сабина Жұмабек", position: "Кассир" },
  { id: "p-10", name: "Арман Қасымов", position: "Повар" },
  { id: "p-11", name: "Динара Әлімова", position: "Администратор смены" },
  { id: "p-12", name: "Бекзат Мұратов", position: "Курьер" },
]

export function searchPeople(query: string): Person[] {
  const q = query.trim().toLowerCase()
  if (!q) return PEOPLE
  return PEOPLE.filter(
    (p) => p.name.toLowerCase().includes(q) || p.position.toLowerCase().includes(q),
  )
}
