"use client";

import { useEffect } from "react";

export default function SeedUsers() {
  useEffect(() => {
    try {
      const existing = JSON.parse(localStorage.getItem("usuarios") || "[]");
      const emails = existing.map((u) => u.email);

      const seeds = [
        {
          nombre: "María López",
          email: "organizer1@example.com",
          telefono: "0991111111",
          ciudad: "Portoviejo",
          role: "organizer",
          organizationName: "Verde Manabí",
          organizationWebsite: "https://verdemanabi.example",
          password: "password123",
          fechaRegistro: new Date().toISOString(),
        },
        {
          nombre: "Juan Carlos",
          email: "organizer2@example.com",
          telefono: "0992222222",
          ciudad: "Manta",
          role: "organizer",
          organizationName: "Bosques Manabí",
          organizationWebsite: "https://bosquesmanabi.example",
          password: "password123",
          fechaRegistro: new Date().toISOString(),
        },
        {
          nombre: "Ana Pérez",
          email: "usuario@example.com",
          telefono: "0993333333",
          ciudad: "Jipijapa",
          role: "user",
          password: "password123",
          fechaRegistro: new Date().toISOString(),
        },
        {
          nombre: "Lucía Gómez",
          email: "organizer3@example.com",
          telefono: "0994444444",
          ciudad: "Chone",
          role: "organizer",
          organizationName: "Reforestando Manabí",
          organizationWebsite: "https://reforestandomanabi.example",
          password: "password123",
          fechaRegistro: new Date().toISOString(),
        },
      ];

      let changed = false;
      seeds.forEach((s) => {
        if (!emails.includes(s.email)) {
          existing.push(s);
          changed = true;
        }
      });

      if (changed) {
        localStorage.setItem("usuarios", JSON.stringify(existing));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return null;
}
