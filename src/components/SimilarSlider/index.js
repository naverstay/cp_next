import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Manipulation, Navigation } from 'swiper'

import apiGET from '../../utils/search'

import NextLink from '@/components/NextLink'
import { uniqArray } from '@/utils/uniqArray'

const SimilarSlider = (props) => {
  const { itemData, searchData } = props

  console.log('searchData', searchData)

  const navigationPrevRef = useRef()
  const navigationNextRef = useRef()

  const [similarSlides, setSimilarSlides] = useState([])
  const [analogSliderTitles, setAnalogSliderTitles] = useState([])

  const swiperParams = {
    modules: [Navigation, Manipulation],
    slidesPerView: 1,
    breakpoints: {
      // when window width is >= 480px
      600: {
        slidesPerView: 2,
      },
      900: {
        slidesPerView: 4,
      },
      1200: {
        slidesPerView: 6,
      },
    },
    navigation: {
      enabled: true,
    },
    on: {
      init: (swiper) => {
        swiper.params.navigation.prevEl = navigationPrevRef.current
        swiper.params.navigation.nextEl = navigationNextRef.current
        swiper.navigation.destroy()
        swiper.navigation.init()
        swiper.navigation.update()
      },
      reachEnd: (swiper) => {
        console.log('reachEnd')
        // setTimeout(() => {
        //   swiper.appendSlide([...Array(6)].map((m, mi) => `<div class="swiper-slide">` + slideBuilder(slideData, swiper.slides.length + mi + 1) + "</div>"));
        // }, 1000);
      },
    },
  }

  const similarItems = useMemo(() => {
    return similarSlides.length
      ? similarSlides.map((s, si) => {
          return (
            <NextLink className={'catalogue__similar-link'} key={si} to={'/' + s.slug}>
              {s.part_no}
            </NextLink>
          )
        })
      : null
  }, [similarSlides])

  useEffect(() => {
    console.log('itemData', itemData)

    //if (itemData && itemData.hasOwnProperty('slug')) {
    //  const requestURL = `/catalog/${itemData.slug}/similar`
    //
    //  apiGET(requestURL, {}, (data) => {
    //    if (data && data.error) {
    //      console.log('similar error', data)
    //    } else {
    //      let titles = ['manufacturer', 'part_no']
    //      let slides = []
    //
    //      for (let i = 0; i < data.length; i++) {
    //        const datum = data[i]
    //        let slide = { part_no: datum.title, slug: datum.slug }
    //
    //        if (datum.hasOwnProperty('snippet')) {
    //          slide.manufacturer = datum.snippet.manufacturer.name
    //
    //          if (datum.snippet.hasOwnProperty('specs')) {
    //            for (let j = 0; j < datum.snippet.specs.length; j++) {
    //              const spec = datum.snippet.specs[j]
    //
    //              titles.push(spec.attribute.name)
    //              slide[spec.attribute.name] = spec.display_value
    //            }
    //          }
    //        }
    //
    //        slides.push(slide)
    //      }
    //
    //      setAnalogSliderTitles(uniqArray(titles))
    //      setSimilarSlides(slides)
    //    }
    //  })
    //}
  }, [])

  // const slideBuilder = (s, index) => {
  //   let ret = `<div class="catalogue-page__analogue-item">`;
  //   analogSliderTitles.forEach((v, vi) => {
  //     // const text = v === "part_no" ? <NextLink href={s.slug}>{s[v]}</Link> : s[v];
  //
  //     ret += `<div class="catalogue-page__analogue-param ${(vi % 2 === 0 ? "__odd" : "__even")}"><span class="catalogue-page__analogue-value">${s[v] || ""}</span></div>`;
  //   });
  //
  //   return ret + "</div>";
  // };

  // const similarSliderHTML = useMemo(() => {
  //   return similarSlides.length ?
  //     <Swiper {...swiperParams} navigation spaceBetween={10} onInit={(swiper) => {
  //       navigationPrevRef.current.onClick = () => {
  //         console.log("prev", swiper);
  //       };
  //
  //       navigationNextRef.current.onClick = () => {
  //         console.log("next", swiper);
  //       };
  //     }}>
  //       {similarSlides.map((s, si) => {
  //         return <div key={si} className={"swiper-slide"}
  //                     dangerouslySetInnerHTML={{ __html: slideBuilder(s, si + 1) }} />;
  //       })}
  //     </Swiper> : null
  //     ;
  // }, [similarSlides]);

  return similarSlides.length ? (
    <>
      <article className="article __catalogue">
        <p>Аналоги</p>
      </article>

      <div className="catalogue__similar">{similarItems}</div>

      {/*<div className="catalogue-page__analogue">*/}
      {/*  <div ref={navigationPrevRef}*/}
      {/*       className="btn __blue analogue-slider__button analogue-slider__button--prev" />*/}
      {/*  <div ref={navigationNextRef}*/}
      {/*       className="btn __blue analogue-slider__button analogue-slider__button--next" />*/}
      {/*  <div className="catalogue-page__analogue-title">*/}
      {/*    <div className="catalogue-page__analogue-item">*/}
      {/*      {analogSliderTitles.map((t, ti) => {*/}
      {/*        const text = t === "part_no" ? "Номер детали" : t === "manufacturer" ? "Производитель" : t;*/}
      {/*        return <div key={ti} className="catalogue-page__analogue-param">{text}</div>;*/}
      {/*      })}*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*  <div className="catalogue-page__analogue-slider">*/}
      {/*    {similarSliderHTML}*/}
      {/*  </div>*/}
      {/*</div>*/}
    </>
  ) : null
}

export default SimilarSlider
