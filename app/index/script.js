"use strict";

document.addEventListener('DOMContentLoaded', function(){
  console.log('Скрипт Swiper подключен')

  const swiperIntro = new Swiper('.b-main-intro__swiper', {
    
    
    // Стрелки
    navigation: {
      prevEl: '.b-main-intro__button--prev',
      nextEl: '.b-main-intro__button--next',
    },

    pagination: {
      el: '.swiper-pagination',
    },
    // Возможность управлять с клавиатуры
    // keyboard: {
    //   enabled: true,
    //   onlyInViewport: true,
    // },
    // // Отключение слайдера, если слайдов меньше видимой области
    // watchOverflow: true,
  });
  
  const swiperGallery = new Swiper('.b-main-gallery__swiper', {
    breakpoints: {
      // when window width is >= 320px
      320: {
        slidesPerView: 1
      },
      // when window width is >= 640px
      640: {
        slidesPerView: 3
      },
      // when window width is >= 1450px
      1450: {
        slidesPerView: 4
      }
    },
    
    // Стрелки
    navigation: {
      prevEl: '.b-main-gallery__swiper-button-prev',
      nextEl: '.b-main-gallery__swiper-button-next',
    },
    // Возможность управлять с клавиатуры
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    // Отключение слайдера, если слайдов меньше видимой области
    watchOverflow: true,
  });
})

