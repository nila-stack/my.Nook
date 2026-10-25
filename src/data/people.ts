export type Person = { id: string; name: string; email: string };

export const people: Person[] = [
  { id: "remi", name: "Remi", email: "remi@mynook.app" },
  { id: "aanya", name: "Aanya Sharma", email: "aanya@studiolumen.in" },
  { id: "kabir", name: "Kabir Mehta", email: "kabir@studiolumen.in" },
  { id: "isha", name: "Isha Rao", email: "isha@pixelhaus.co" },
  { id: "dev", name: "Dev Malhotra", email: "dev@pixelhaus.co" },
  { id: "meera", name: "Meera Nair", email: "meera@brightfolk.com" },
  { id: "arjun", name: "Arjun Kapoor", email: "arjun@brightfolk.com" },
];

export const personById = (id: string) =>
  people.find((p) => p.id === id) ?? people[0];

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
