import React, { useEffect, useState } from 'react'

import apiGET from '../../utils/search'

import NextLink from '@/components/NextLink'

function Footer() {
  const [offerLink, setOfferLink] = useState('#')

  useEffect(() => {
    const requestURL = '/settings'

    apiGET(requestURL, {}, (data) => {
      if (data?.offer_file) {
        setOfferLink(data.offer_file.value)
      }
    })
  }, [])

  console.log('render Footer')

  return (
    <footer className="footer row">
      <div className="column lg-col-10">
        <div className="footer-content">
          <div className="footer-copyright">
            2012-2021 © ООО «Катпарт», ИНН&nbsp;5406814289 <br />
            Для повышения удобства сайт использует cookies. Оставаясь на сайте, вы соглашаетесь с{' '}
            <NextLink className="footer-link" to="/privacy-policy/">
              политикой конфиденциальности
            </NextLink>
            .
          </div>

          <div className="footer-phone">
            <a className="footer-link" href="tel:88005057388">
              8-800-505-73-88
            </a>
          </div>

          <div className="footer-sales">
            <a className="footer-link" href="mailto:sales@catpart.ru">
              sales@catpart.ru
            </a>
          </div>

          <div className="footer-offer">
            <a className="footer-link" href={offerLink}>
              Оферта
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
