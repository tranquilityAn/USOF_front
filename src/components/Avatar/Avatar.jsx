import defaultAvatar from '../../assets/default-avatar.svg';
import { getAvatarUrl } from '../../utils/getAvatarUrl';

export default function Avatar({ src, alt = 'avatar', size = 40, className = '', ...rest }) {
    const resolved = getAvatarUrl(src) || defaultAvatar;

    return (
        <img
            src={resolved}
            alt={alt}
            width={size}
            height={size}
            className={className}
            loading="lazy"
            onError={(e) => { e.currentTarget.src = defaultAvatar; }}
            style={{ borderRadius: 999, objectFit: 'cover', background: '#222a33', ...rest.style }}
            {...rest}
        />
    );
}

