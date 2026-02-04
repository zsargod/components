import { createElement, icons } from 'https://cdn.jsdelivr.net/npm/lucide@0.555.0/+esm';

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);
const kebabToCamel = str => str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
const module = (el,icon) => el.replaceWith(createElement(icons[capitalize(kebabToCamel(icon))]));
export default module;