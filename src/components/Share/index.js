import React from 'react'
import { useDetectClickOutside } from 'react-detect-click-outside'
import Ripples from 'react-ripples'

import copyTextToClipboard from '../../utils/clipboard'

function Share({ setOpenFunc, notificationFunc, shareUrl, shareText }) {
  const shareRef = useDetectClickOutside({
    onTriggered: () => {
      setOpenFunc(false)
    },
  })

  const successCopy = (text) => {
    notificationFunc('success', `URL страницы скопирован в буфер обмена`, text)
  }

  const failCopy = () => {
    notificationFunc('success', `Ошибка копирования в буфер обмена`, ':(')
  }

  const dropdownAction = (action) => {
    if (action === 'copy') {
      copyTextToClipboard(window.location.href, successCopy, failCopy)
    }

    setOpenFunc(false)
  }

  const links = [
    {
      href: `whatsapp://send?text=${shareText}%20${shareUrl}`,
      name: 'WhatsApp',
    },
    {
      href: `https://telegram.me/share/url?text=${shareText}&url=${shareUrl}`,
      name: 'Telegram',
    },
    {
      href: `http://vk.com/share.php?title=${shareText}&url=${shareUrl}`,
      name: 'Вконтакте',
    },
    {
      href: `mailto:?subject=${shareText}&body=${shareUrl}`,
      name: 'Email',
    },
    {
      action: 'copy',
      name: 'Копировать ссылку',
    },
  ]

  return (
    <div ref={shareRef} className="dropdown-container">
      <ul className="dropdown-list">
        {links.map((l, li) => (
          <li key={li}>
            {l.action ? (
              <Ripples
                onClick={() => {
                  dropdownAction(l.action)
                }}
                className="dropdown-link"
                during={1000}
              >
                {l.name}
              </Ripples>
            ) : (
              <Ripples className="dropdown-link" during={1000}>
                <a
                  onClick={() => {
                    dropdownAction()
                  }}
                  target="_blank"
                  rel="noreferrer"
                  className="dropdown-link-inner"
                  href={l.href}
                >
                  {l.name}
                </a>
              </Ripples>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Share
