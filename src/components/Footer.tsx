import { asset } from '@/lib/asset';
import Brand from './Brand';
import Icon from './Icon';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container footer-main"><Brand /><div><p>Южный берег Крыма</p><address>Курпаты, Алупкинское шоссе, 12</address></div><a href="#top" className="back-to-top">Вернуться к началу <Icon /></a></div>
            <div className="container footer-bottom"><p>© {new Date().getFullYear()} Курпаты</p><a href={asset('/privacy/')}>Персональные данные</a><a href={asset('/materials/')}>О материалах</a><p>Время быть у моря</p></div>
            <div className="container footer-notice"><p>Предварительная презентация комплекса. Используются архивные фотографии. Приём гостей, актуальное состояние номеров и состав услуг требуют подтверждения. Возможность отдыха уточняется у представителя.</p></div>
        </footer>
    );
}
