'use strict';

const $ = (selector) => document.querySelector(selector);
const menuButton = $('.menu-toggle');
const navigation = $('#navigation');

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
  navigation.classList.remove('is-open');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  navigation.classList.toggle('is-open', open);
});
navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.header')) closeMenu();
});
window.matchMedia('(min-width: 801px)').addEventListener('change', closeMenu);

document.querySelectorAll('[data-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach((filter) => {
      const selected = filter === button;
      filter.classList.toggle('active', selected);
      filter.setAttribute('aria-pressed', String(selected));
    });
    document.querySelectorAll('[data-category]').forEach((project) => {
      project.hidden = button.dataset.filter !== 'all' && project.dataset.category !== button.dataset.filter;
    });
  });
});

document.querySelectorAll('[data-close-dialog]').forEach((button) => {
  button.addEventListener('click', () => button.closest('dialog').close());
});
document.querySelectorAll('dialog').forEach((dialog) => {
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
});

const estimateDialog = $('#estimate-dialog');
document.querySelectorAll('[data-open-estimate]').forEach((button) => {
  button.addEventListener('click', () => estimateDialog.showModal());
});
const estimateForm = $('#estimate-form');
const rates = { frame: 45000, block: 60000, brick: 75000 };
const technologyNames = { frame: 'Каркас', block: 'Газобетон', brick: 'Кирпич' };
const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1, minimumFractionDigits: 1 });

function getEstimate() {
  const data = new FormData(estimateForm);
  const area = Number(data.get('area'));
  const technology = data.get('technology');
  const finish = data.has('finish');
  const cost = area * (rates[technology] + (finish ? 20000 : 0));
  return { area, technology, finish, price: `${number.format(cost * 0.9 / 1000000)}–${number.format(cost * 1.1 / 1000000)} млн ₽` };
}
function updateEstimate() {
  const result = getEstimate();
  $('#area-value').value = `${result.area} м²`;
  $('#estimate-price').textContent = result.price;
}
estimateForm.addEventListener('input', updateEstimate);
estimateForm.addEventListener('submit', (event) => event.preventDefault());
updateEstimate();

function focusContact(message, service = 'Строительство') {
  $('#service-select').value = service;
  if (message) $('#brief-form [name="message"]').value = message;
  $('#brief-result').hidden = true;
  $('#contact').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  $('#brief-form [name="name"]').focus({ preventScroll: true });
}
$('#use-estimate').addEventListener('click', () => {
  const result = getEstimate();
  estimateDialog.close();
  focusContact(`Дом ${result.area} м². Технология: ${technologyNames[result.technology]}. ${result.finish ? 'С чистовой отделкой' : 'Без чистовой отделки'}. Ориентировочный бюджет по деморасчёту: ${result.price}.`);
});
document.querySelectorAll('[data-service]').forEach((link) => {
  link.addEventListener('click', () => {
    $('#service-select').value = link.dataset.service;
    $('#brief-result').hidden = true;
  });
});

const projects = {
  residence: { title: 'Лесная резиденция', image: './assets/hero.webp', alt: 'Современный загородный дом среди деревьев', area: '240 м²', style: 'Современная архитектура', service: 'Строительство', description: 'Идея дома, открытого природе: панорамное остекление, просторная общая зона и связь с садом. Тёмный фасад подчёркивает чистые линии, а тёплый свет делает пространство уютным. Площадь и описание условны; фотография служит референсом.' },
  light: { title: 'Свет и пространство', image: './assets/project-forest.webp', alt: 'Минималистичный интерьер с панорамными окнами', area: '180 м²', style: 'Натуральные фактуры', service: 'Отделка и интерьер', description: 'Открытая планировка, естественный свет и сдержанная палитра. Дерево, камень и графичные детали создают спокойное пространство для повседневной жизни. Площадь и описание условны; фотография служит референсом.' },
  warm: { title: 'Тёплый минимализм', image: './assets/project-modern.webp', alt: 'Светлая гостиная с деревянной лестницей', area: '160 м²', style: 'Семейный интерьер', service: 'Отделка и интерьер', description: 'Светлая гостиная, мягкие текстуры и дерево в главной роли. Концепция пространства, где удобно собраться всей семьёй и где у каждой детали есть своё место. Площадь и описание условны; фотография служит референсом.' }
};
const projectDialog = $('#project-dialog');
let selectedProject = null;
document.querySelectorAll('[data-project]').forEach((button) => {
  button.addEventListener('click', () => {
    selectedProject = projects[button.dataset.project];
    $('#project-dialog-title').textContent = selectedProject.title;
    $('#project-dialog-image').src = selectedProject.image;
    $('#project-dialog-image').alt = selectedProject.alt;
    $('#project-dialog-description').textContent = selectedProject.description;
    $('#project-dialog-area').textContent = selectedProject.area;
    $('#project-dialog-style').textContent = selectedProject.style;
    projectDialog.showModal();
  });
});
$('#discuss-project').addEventListener('click', () => {
  if (!selectedProject) return;
  projectDialog.close();
  focusContact(`Интересует проект в стиле концепции «${selectedProject.title}».`, selectedProject.service);
});

let preparedBrief = '';
const briefForm = $('#brief-form');
briefForm.addEventListener('input', () => { $('#brief-result').hidden = true; preparedBrief = ''; });
briefForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(briefForm);
  const name = String(data.get('name')).trim();
  const phone = String(data.get('phone')).trim();
  const digits = phone.replace(/\D/g, '');
  if (!name) {
    briefForm.elements.name.setCustomValidity('Укажите ваше имя.');
    briefForm.elements.name.reportValidity();
    return;
  }
  briefForm.elements.name.setCustomValidity('');
  if (digits.length < 7 || digits.length > 15) {
    briefForm.elements.phone.setCustomValidity('Укажите номер от 7 до 15 цифр.');
    briefForm.elements.phone.reportValidity();
    return;
  }
  briefForm.elements.phone.setCustomValidity('');
  preparedBrief = ['ЗАЯВКА НА ОБСУЖДЕНИЕ ПРОЕКТА', '', `Имя: ${name}`, `Телефон: ${phone}`, `Услуга: ${data.get('service')}`, '', 'Описание проекта:', String(data.get('message')).trim() || 'Детали пока не указаны.', '', 'Подготовлено на демонстрационном сайте ОСНОВА.', 'Заявка не была отправлена. Контакты и пожелания передаются получателю самостоятельно.'].join('\n');
  $('#brief-result').hidden = false;
  $('#brief-result').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
});
for (const field of [briefForm.elements.name, briefForm.elements.phone]) {
  field.addEventListener('input', () => field.setCustomValidity(''));
}
$('#download-brief').addEventListener('click', () => {
  if (!preparedBrief) return;
  const url = URL.createObjectURL(new Blob(['\uFEFF', preparedBrief], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'osnova-project-brief.txt';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
