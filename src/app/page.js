"use client";
import { useState } from 'react';
import mainImage from "../assets/logo-reforestacion.png";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLanguage } from '@/contexts/LanguageContext';
import { Leaf, ArrowRight, TreeDeciduous, Cloud } from 'lucide-react';

function Home() {
  const { t } = useLanguage();

  return (
    <div className="w-full bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section
        id="inicio"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background con gradiente y patrón */}
        <div className="absolute inset-0 bg-linear-to-br from-forest-pale via-forest-lightest to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-950">
          <div
            className="absolute inset-0 opacity-10 dark:opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231a7a56' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        {/* Contenido del Hero */}
        <div className="relative max-w-7xl mx-auto lg:px-8 ">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Lado izquierdo - Texto */}
            <div className="space-y-8">
              <div className="inline-block">
                <span className="bg-forest-lightest text-forest-dark px-5 py-2 rounded-full text-sm font-semibold tracking-wide uppercase dark:bg-green-900/30 dark:text-green-300 flex items-center gap-2 w-fit">
                  <Leaf className="w-4 h-4" />
                  {t('home.badge')}
                </span>
              </div>

              <h1 className="text-3xl md:text-6xl lg:text-5xl font-extrabold text-forest-darkest leading-tight dark:text-white">
                {t('home.titulo1')}
                <span className="block mt-2 text-forest-primary dark:text-green-400">
                  {t('home.titulo2')}
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-forest-dark leading-relaxed max-w-2xl dark:text-gray-300">
                {t('home.descripcion1')}{" "}
                <span className="font-bold text-forest-primary dark:text-green-400">
                  {t('home.hectareas')}
                </span>{" "}
                {t('home.descripcion2')}
              </p>

              {/* Estadísticas rápidas */}
              <div className="grid grid-cols-3 gap-6 pt-4">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-forest-primary dark:text-green-400">
                    5,247
                  </div>
                  <div className="text-sm text-forest-dark mt-1 dark:text-gray-400">
                    {t('home.arbolesPlantados')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-forest-primary dark:text-green-400">
                    234
                  </div>
                  <div className="text-sm text-forest-dark mt-1 dark:text-gray-400">
                    {t('home.hectareasLabel')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-forest-primary dark:text-green-400">
                    892
                  </div>
                  <div className="text-sm text-forest-dark mt-1 dark:text-gray-400">
                    {t('home.voluntarios')}
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a 
                  href="/proyectos"
                  className="group relative bg-green-800 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl overflow-hidden dark:bg-green-600 dark:hover:bg-green-500">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {t('home.verProyectos')}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-forest-dark transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </a>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4 pt-6">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-forest-light border-2 border-white dark:border-gray-800"></div>
                  <div className="w-10 h-10 rounded-full bg-forest-medium border-2 border-white dark:border-gray-800"></div>
                  <div className="w-10 h-10 rounded-full bg-forest-primary border-2 border-white dark:border-gray-800"></div>
                  <div className="w-10 h-10 rounded-full bg-forest-dark border-2 border-white dark:border-gray-800"></div>
                </div>
                <p className="text-sm text-forest-dark dark:text-gray-400">
                  <span className="font-bold dark:text-white">
                    {t('home.personas')}
                  </span>{" "}
                  {t('home.seUnieron')}
                </p>
              </div>
            </div>

            {/* Lado derecho - Imagen/Ilustración */}
            <div className="relative">
              <div className="relative w-full aspect-square max-w-xl mx-auto">
                {/* Círculos decorativos */}
                <div className="absolute inset-0 bg-forest-lightest rounded-full opacity-50 transform scale-95"></div>
                <div className="absolute inset-0 bg-forest-lighter rounded-full opacity-30 transform scale-90"></div>

                {/* Contenedor de imagen principal */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4/5 h-4/5 bg-linear-to-t from-green-200 to-green-700 rounded-full shadow-2xl flex items-center justify-center">
                    <img
                      src={mainImage.src}
                      alt="Ilustración de reforestación"
                      className="w-3/4 h-3/4 object-contain"
                    />
                  </div>
                </div>

                {/* Badges flotantes */}
                <div className="absolute top-10 -left-4 bg-white rounded-2xl shadow-xl p-4 transform rotate-3 hover:rotate-0 transition-transform dark:bg-gray-800 dark:shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-forest-lightest rounded-full flex items-center justify-center dark:bg-green-900/30">
                      <TreeDeciduous className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="text-xs text-forest-dark dark:text-gray-400">
                        {t('home.arbolesNativos')}
                      </div>
                      <div className="text-lg font-bold text-forest-primary dark:text-green-400">
                        {t('home.especies')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-10 -right-4 bg-white rounded-2xl shadow-xl p-4 transform -rotate-3 hover:rotate-0 transition-transform dark:bg-gray-800 dark:shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-forest-lightest rounded-full flex items-center justify-center dark:bg-green-900/30">
                      <Cloud className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="text-xs text-forest-dark dark:text-gray-400">
                        {t('home.co2Capturado')}
                      </div>
                      <div className="text-lg font-bold text-forest-primary dark:text-green-400">
                        {t('home.toneladas')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function HomePageWrapper() {
  return (
    <ProtectedRoute>
      <Home />
    </ProtectedRoute>
  );
}

export default HomePageWrapper;
