import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4c1.1 0 2 .9 2 2v10h2V6c0-1.1.9-2 2-2s2 .9 2 2v10h2V6c0-1.1.9-2 2-2s2 .9 2 2v12a8 8 0 0 1-6 7.75V34a2 2 0 1 1-4 0v-8.25A8 8 0 0 1 10 18V6c0-1.1.9-2 2-2Z" />
            <path d="M29 5c3.3 2.7 5 6.7 5 12v17a2 2 0 1 1-4 0v-8h-3a2 2 0 0 1-2-2v-7c0-4.7 1.3-8.7 4-12Z" />
        </svg>
    );
}
