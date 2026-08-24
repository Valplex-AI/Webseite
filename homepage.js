(function () {
    const root = document.documentElement;
    const heroStage = document.querySelector('.hero-stage');
    const siteHeader = document.querySelector('.site-header');
    const logo = document.querySelector('.logo');
    const headline = document.querySelector('h1');
    const headlineFull = document.querySelector('.headline-full');
    const heroWordmark = document.querySelector('.hero-wordmark');
    let ticking = false;
    let viewport = window.innerHeight || 1;
    let stageHeight = heroStage ? Math.max(heroStage.offsetHeight - viewport, 1) : viewport;
    let phaseOneEnd = 0.58;
    let stageStart = heroStage ? heroStage.offsetTop : 0;
    let useDirectMobileMotion = false;
    let lastPhaseOne = '';
    let lastPhaseTwo = '';
    let lastProgress = '';
    let lastLogoTransform = '';
    let lastHeadlineTransform = '';
    let lastHeadlineOpacity = '';
    let lastWordmarkTransform = '';
    let lastWordmarkOpacity = '';
    let headerVisible = false;
    let headerHandoff = false;

    function refreshMeasurements() {
        viewport = window.innerHeight || 1;
        stageHeight = heroStage ? Math.max(heroStage.offsetHeight - viewport, 1) : viewport;
        phaseOneEnd = parseFloat(getComputedStyle(root).getPropertyValue('--phase-one-end')) || 0.58;
        stageStart = heroStage ? heroStage.offsetTop : 0;
        useDirectMobileMotion = window.matchMedia('(max-width: 780px)').matches;

        if (!useDirectMobileMotion) {
            [logo, headline, headlineFull, heroWordmark].forEach(function (element) {
                if (element) {
                    element.removeAttribute('style');
                }
            });
            lastLogoTransform = '';
            lastHeadlineTransform = '';
            lastHeadlineOpacity = '';
            lastWordmarkTransform = '';
            lastWordmarkOpacity = '';
        }
    }

    function formatPx(value) {
        return `${Math.round(value * 100) / 100}px`;
    }

    function updateMobileMotion(phaseOne, phaseTwo, isHandoff) {
        const motionUnit = viewport / 100;
        const logoTransform = `translate3d(-50%, ${formatPx((18 * motionUnit) - (phaseOne * 7 * motionUnit) - (phaseTwo * 9 * motionUnit))}, 0) scale(${1 - (phaseTwo * 0.12)})`;
        const headlineTransform = `translate3d(-50%, calc(-50% + ${formatPx((phaseOne * -18 * motionUnit) - (phaseTwo * 7 * motionUnit))}), 0) scale(${1 - (phaseOne * 0.04) - (phaseTwo * 0.05)})`;
        const headlineOpacity = `${Math.max(1 - phaseOne, 0)}`;
        const wordmarkTransform = `translate3d(-50%, calc(-50% + ${formatPx((24 * motionUnit) - (phaseOne * 13 * motionUnit) - (phaseTwo * 11 * motionUnit))}), 0) scale(${0.9 + (phaseOne * 0.05) + (phaseTwo * 0.03)})`;
        const wordmarkOpacity = isHandoff ? '0' : `${Math.min((phaseOne * 0.7) + (phaseTwo * 0.3), 1)}`;

        if (logo && logoTransform !== lastLogoTransform) {
            logo.style.transform = logoTransform;
            lastLogoTransform = logoTransform;
        }

        if (headline && headlineTransform !== lastHeadlineTransform) {
            headline.style.transform = headlineTransform;
            lastHeadlineTransform = headlineTransform;
        }

        if (headlineFull && headlineOpacity !== lastHeadlineOpacity) {
            headlineFull.style.opacity = headlineOpacity;
            lastHeadlineOpacity = headlineOpacity;
        }

        if (heroWordmark && wordmarkTransform !== lastWordmarkTransform) {
            heroWordmark.style.transform = wordmarkTransform;
            lastWordmarkTransform = wordmarkTransform;
        }

        if (heroWordmark && wordmarkOpacity !== lastWordmarkOpacity) {
            heroWordmark.style.opacity = wordmarkOpacity;
            lastWordmarkOpacity = wordmarkOpacity;
        }
    }

    function updateProgress() {
        const scrollTop = window.scrollY || window.pageYOffset || 0;
        const travelled = Math.min(Math.max(scrollTop - stageStart, 0), stageHeight);
        const progress = Math.min(Math.max(travelled / stageHeight, 0), 1);
        const phaseOne = Math.min(progress / phaseOneEnd, 1);
        const phaseTwo = progress <= phaseOneEnd ? 0 : Math.min((progress - phaseOneEnd) / (1 - phaseOneEnd), 1);
        const progressValue = progress.toFixed(4);
        const phaseOneValue = phaseOne.toFixed(4);
        const phaseTwoValue = phaseTwo.toFixed(4);
        const nextHeaderVisible = headerVisible ? progress >= 0.78 : progress >= 0.82;
        const nextHeaderHandoff = headerHandoff ? progress >= 0.74 : progress >= 0.8;

        if (useDirectMobileMotion) {
            updateMobileMotion(phaseOne, phaseTwo, nextHeaderHandoff);
        } else {
            if (heroStage && progressValue !== lastProgress) {
                heroStage.style.setProperty('--progress', progressValue);
                lastProgress = progressValue;
            }

            if (heroStage && phaseOneValue !== lastPhaseOne) {
                heroStage.style.setProperty('--phase-one', phaseOneValue);
                lastPhaseOne = phaseOneValue;
            }

            if (heroStage && phaseTwoValue !== lastPhaseTwo) {
                heroStage.style.setProperty('--phase-two', phaseTwoValue);
                lastPhaseTwo = phaseTwoValue;
            }
        }

        if (heroStage && nextHeaderHandoff !== headerHandoff) {
            heroStage.classList.toggle('is-header-handoff', nextHeaderHandoff);
            headerHandoff = nextHeaderHandoff;
        }

        if (siteHeader) {
            if (nextHeaderVisible !== headerVisible) {
                siteHeader.classList.toggle('is-visible', nextHeaderVisible);
                headerVisible = nextHeaderVisible;
            }
        }
        ticking = false;
    }

    function requestUpdate() {
        if (ticking) {
            return;
        }

        ticking = true;
        window.requestAnimationFrame(updateProgress);
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', function () {
        refreshMeasurements();
        requestUpdate();
    });

    refreshMeasurements();
    updateProgress();
})();
