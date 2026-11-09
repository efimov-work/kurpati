import type { Metadata } from 'next';
import { asset } from '@/lib/asset';
import { absolute } from '@/lib/seo';
import media from '@/lib/media.json';

export const metadata: Metadata = { title: 'О проекте и материалах', alternates: { canonical: absolute('/materials/') }, robots: { index: false, follow: false } };

export default function MaterialsPage() {
    return <main className="container document-page"><a href={asset('/')}>Вернуться к Курпатам</a><h1>О проекте<br />и материалах</h1><p>Это предварительная презентация архитектуры и окружения комплекса «Курпаты». Она не подтверждает текущую работу санатория, наличие номеров или доступность услуг.</p><p>Используются реальные архивные фотографии. Актуальность состояния помещений и условия отдыха требуют подтверждения у представителя.</p><h2>Фотографии</h2><p>Для локального просмотра подготовлены веб-копии. На части кадров программно удалена рекламная подпись сайта. Геометрия и состав сцены за пределами маски подписи сохранены. Обрезка и адаптация разрешения могут отличаться от оригинала.</p><ul>{media.map(item => <li key={item.name}><strong>{item.name}</strong>. {item.author}. <a href={item.source} target="_blank" rel="noreferrer">Источник</a>. {item.licenseUrl ? <a href={item.licenseUrl} target="_blank" rel="noreferrer">{item.license}</a> : item.license}. {item.changes}</li>)}</ul><h2>Источники сведений</h2><p><a href="https://udprf.ru/content/imushchestvennyy-kompleks-kurpaty" target="_blank" rel="noreferrer">Карточка имущественного комплекса</a>. <a href="https://archi.ru/world/75380/pansionat-druzhba" target="_blank" rel="noreferrer">Архитектурная публикация Константина Антипина</a>. <a href="https://s-kurpaty.ru/" target="_blank" rel="noreferrer">Архивные описания учреждения</a>.</p></main>;
}
