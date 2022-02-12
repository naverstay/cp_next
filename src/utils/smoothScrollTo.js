function easeInOutQuart(time, from, distance, duration) {
  if ((time /= duration / 2) < 1) {
    return (distance / 2) * Math.pow(time, 4) + from;
  }

  return (-distance / 2) * ((time -= 2) * Math.pow(time, 3) - 2) + from;
}

export const smoothScrollTo = (target, startY, endY, duration) => {
  let distanceY = endY - startY;
  let startTime = new Date().getTime();

  let timer = window.setInterval(() => {
    let time = new Date().getTime() - startTime;
    let newY = easeInOutQuart(time, startY, distanceY, duration);

    if (time >= duration) {
      window.clearInterval(timer);
    }

    target.scrollTo(0, newY);
  }, 1000 / 60);
};
