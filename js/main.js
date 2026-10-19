(function () {
  'use strict';

  var CONFIG = window.PORTFOLIO_LINKS || {};

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  var hasThree = typeof window.THREE !== 'undefined';

  document.querySelectorAll('[data-link]').forEach(function (a) {
    var url = CONFIG[a.getAttribute('data-link')];
    if (url) { a.href = url; a.hidden = false; }
  });

  /* Toast + copy buttons */
  var toastEl = document.getElementById('toast');
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 1800);
  }
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var value = b.getAttribute('data-copy');
      function fallback() {
        var node = document.getElementById(b.getAttribute('data-target'));
        if (node) {
          var r = document.createRange();
          r.selectNodeContents(node);
          var s = window.getSelection();
          s.removeAllRanges();
          s.addRange(r);
        }
        toast('Selected. Press Ctrl+C to copy');
      }
      try {
        navigator.clipboard.writeText(value).then(function () { toast('Copied ' + value); }, fallback);
      } catch (e) { fallback(); }
    });
  });

  /* Skill marquee + ring + waveform content */
  var marquee = ['React.js', 'Node.js', 'Python', 'C++', 'JavaScript', 'PostgreSQL', 'MongoDB', 'RAG', 'Gemini API', 'Tailwind CSS', 'System Design'];
  var track = document.getElementById('track');
  for (var rep = 0; rep < 2; rep++) {
    marquee.forEach(function (t, i) {
      var s = document.createElement('span');
      s.textContent = t + '  ✦';
      if (i % 3 === 0) s.className = 'fill';
      track.appendChild(s);
    });
  }

  var ringItems = ['React.js', 'Node.js', 'Express.js', 'Python', 'C++', 'JavaScript', 'PostgreSQL', 'MongoDB', 'Tailwind CSS', 'Gemini API'];
  var ring = document.getElementById('ring');
  var small = window.innerWidth < 640;
  var ringR = small ? 150 : 210;
  ring.style.width = (small ? 96 : 130) + 'px';
  ringItems.forEach(function (t, i) {
    var d = document.createElement('div');
    d.className = 'ring-item';
    d.textContent = t;
    d.style.transform = 'rotateY(' + (i * (360 / ringItems.length)) + 'deg) translateZ(' + ringR + 'px)';
    ring.appendChild(d);
  });

  var wave = document.getElementById('wave');
  for (var w = 0; w < 28; w++) {
    var bar = document.createElement('i');
    bar.style.setProperty('--h', (30 + Math.abs(Math.sin(w * 0.7)) * 70) + '%');
    bar.style.setProperty('--d', (w * 0.05) + 's');
    wave.appendChild(bar);
  }

  /* Name: split into characters for the intro */
  var lines = document.querySelectorAll('#name .line');
  lines.forEach(function (line) {
    var text = line.textContent;
    line.textContent = '';
    text.split('').forEach(function (c) {
      var span = document.createElement('span');
      span.className = 'ch';
      span.textContent = c;
      line.appendChild(span);
    });
  });

  /* ------------------------------------------------------------------
     Three.js scene
  ------------------------------------------------------------------ */
  var group = null, baseX = 2.6, camera = null;
  function initScene() {
    var canvas = document.getElementById('scene');
    if (!hasThree) { canvas.style.display = 'none'; return; }
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    } catch (e) { canvas.style.display = 'none'; return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    var scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 0, 9);
    group = new THREE.Group();
    scene.add(group);

    var TEAL = 0x4fe3c8, AMBER = 0xffb347;
    var core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7, 1), new THREE.MeshBasicMaterial({ color: TEAL, wireframe: true, transparent: true, opacity: 0.55 }));
    var inner = new THREE.Mesh(new THREE.IcosahedronGeometry(1.0, 0), new THREE.MeshBasicMaterial({ color: AMBER, wireframe: true, transparent: true, opacity: 0.9 }));
    var knot = new THREE.Mesh(new THREE.TorusKnotGeometry(2.7, 0.05, 220, 12, 2, 3), new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.45 }));
    var ringA = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.012, 8, 140), new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0.5 }));
    var ringB = ringA.clone();
    ringA.rotation.x = Math.PI / 2.4;
    ringB.rotation.set(Math.PI / 5, Math.PI / 3, 0);
    group.add(core, inner, knot, ringA, ringB);

    var sats = [];
    for (var i = 0; i < 6; i++) {
      var m = new THREE.Mesh(new THREE.OctahedronGeometry(0.13), new THREE.MeshBasicMaterial({ color: i % 2 ? TEAL : AMBER }));
      m.userData = { r: 3.2 + Math.random() * 1.3, s: 0.35 + Math.random() * 0.6, o: Math.random() * 6.28, t: (Math.random() - 0.5) * 1.4 };
      group.add(m);
      sats.push(m);
    }

    var count = 1400, pos = new Float32Array(count * 3);
    for (var p = 0; p < count; p++) {
      var r = 6 + Math.random() * 11, th = Math.random() * 6.2832, ph = Math.acos(2 * Math.random() - 1);
      pos[p * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[p * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pos[p * 3 + 2] = r * Math.cos(ph);
    }
    var pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var stars = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xcfd6ff, size: 0.04, transparent: true, opacity: 0.7, sizeAttenuation: true }));
    scene.add(stars);

    function resize() {
      var wd = window.innerWidth, ht = window.innerHeight;
      renderer.setSize(wd, ht, false);
      camera.aspect = wd / ht;
      camera.updateProjectionMatrix();
      var mobile = wd < 820;
      baseX = mobile ? 0 : 2.6;
      group.scale.setScalar(mobile ? 0.8 : 1);
      if (reduce) renderer.render(scene, camera);
    }
    window.addEventListener('resize', resize);
    resize();
    group.position.x = baseX;

    var mx = 0, my = 0;
    window.addEventListener('pointermove', function (e) {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
    });

    if (reduce) { renderer.render(scene, camera); return; }

    var clock = new THREE.Clock();
    (function loop() {
      requestAnimationFrame(loop);
      var t = clock.getElapsedTime();
      core.rotation.x = t * 0.18; core.rotation.y = t * 0.24;
      inner.rotation.x = -t * 0.35; inner.rotation.y = t * 0.3;
      knot.rotation.y = t * 0.12; knot.rotation.z = t * 0.08;
      ringA.rotation.z = t * 0.2; ringB.rotation.z = -t * 0.15;
      stars.rotation.y = t * 0.012;
      sats.forEach(function (s) {
        var a = t * s.userData.s + s.userData.o;
        s.position.set(Math.cos(a) * s.userData.r, Math.sin(a * 0.7) * s.userData.r * 0.35 + s.userData.t, Math.sin(a) * s.userData.r);
        s.rotation.x = t; s.rotation.y = t * 0.7;
      });
      camera.position.x += (mx * 0.9 - camera.position.x) * 0.04;
      camera.position.y += (-my * 0.6 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    })();
  }
  initScene();

  /* ------------------------------------------------------------------
     GSAP: intro, scroll, tilt, ring, counters
  ------------------------------------------------------------------ */
  if (!hasGsap || reduce) return;
  gsap.registerPlugin(ScrollTrigger);

  /* Intro */
  var intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
  intro
    .from('header .eyebrow', { y: 14, opacity: 0, duration: 0.6 })
    .from('#name .ch', { yPercent: 110, rotationX: -90, opacity: 0, duration: 1, stagger: 0.04 }, '-=0.3')
    .from('.roleline', { x: -20, opacity: 0, duration: 0.6 }, '-=0.5')
    .from('header .lead, header .btn', { y: 20, opacity: 0, duration: 0.6, stagger: 0.08 }, '-=0.4')
    .from('header .panel', { y: 30, opacity: 0, rotationX: -25, transformPerspective: 800, duration: 0.7, stagger: 0.08 }, '-=0.4');

  /* Role rotator */
  var roles = ['Full Stack Developer', 'Generative AI Builder', 'Competitive Programmer', 'Open Source Contributor'];
  var ri = 0, roleEl = document.getElementById('role');
  function nextRole() {
    gsap.to(roleEl, { yPercent: -100, opacity: 0, duration: 0.35, ease: 'power2.in', onComplete: function () {
      ri = (ri + 1) % roles.length;
      roleEl.textContent = roles[ri];
      gsap.fromTo(roleEl, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.4, ease: 'power2.out' });
      gsap.delayedCall(2.2, nextRole);
    } });
  }
  gsap.delayedCall(3, nextRole);

  /* Marquee */
  gsap.to(track, { xPercent: -50, duration: 36, ease: 'none', repeat: -1 });

  /* Scroll progress */
  gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 } });

  /* 3D object follows the page */
  if (group) {
    gsap.to(group.rotation, { y: Math.PI * 3, x: 0.6, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1 } });
    var path = gsap.timeline({ scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1.2, invalidateOnRefresh: true } });
    path
      .to(group.position, { x: function () { return -baseX; }, duration: 1, ease: 'power1.inOut' })
      .to(group.position, { x: function () { return baseX; }, duration: 1, ease: 'power1.inOut' })
      .to(group.position, { x: function () { return -baseX * 0.8; }, duration: 1, ease: 'power1.inOut' })
      .to(group.position, { x: 0, duration: 1, ease: 'power1.inOut' })
      .to(camera.position, { z: 7.5 }, '<');
  }

  /* Section reveals (start from a dimmed state, never fully hidden) */
  gsap.utils.toArray('[data-reveal]').forEach(function (el) {
    gsap.from(el, { y: 50, opacity: 0.25, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });

  /* Timeline line draws with scroll */
  gsap.to('#tlFill', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#timeline', start: 'top 70%', end: 'bottom 60%', scrub: 0.5 } });

  /* Counters */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var o = { v: 0 };
    gsap.fromTo(o, { v: 0 }, { v: target, duration: 1.6, ease: 'power2.out', immediateRender: false,
      onUpdate: function () { el.textContent = Math.round(o.v) + suffix; },
      scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });

  /* Skill ring */
  gsap.set(ring, { rotationX: -12 });
  var spin = gsap.to(ring, { rotationY: 360, duration: 30, ease: 'none', repeat: -1 });
  var rs = document.getElementById('ringScene');
  rs.addEventListener('pointerenter', function () { gsap.to(spin, { timeScale: 0.15, duration: 0.6 }); });
  rs.addEventListener('pointerleave', function () { gsap.to(spin, { timeScale: 1, duration: 0.6 }); });

  /* Card tilt */
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine) {
    document.querySelectorAll('.tilt').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(card, { rotationY: px * 10, rotationX: -py * 10, transformPerspective: 1000, duration: 0.4, ease: 'power2.out' });
      });
      card.addEventListener('pointerleave', function () {
        gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
      });
    });
  }
})();
