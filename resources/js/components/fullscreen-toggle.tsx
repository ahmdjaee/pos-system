import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function FullscreenToggle() {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSupported, setIsSupported] = useState(true);

    useEffect(() => {
        setIsSupported(Boolean(document.documentElement.requestFullscreen));

        const updateState = () => setIsFullscreen(Boolean(document.fullscreenElement));

        updateState();
        document.addEventListener('fullscreenchange', updateState);

        return () => document.removeEventListener('fullscreenchange', updateState);
    }, []);

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
            return;
        }

        await document.exitFullscreen();
    };

    if (!isSupported) {
        return null;
    }

    const Icon = isFullscreen ? Minimize2 : Maximize2;
    const label = isFullscreen ? 'Keluar layar penuh' : 'Layar penuh';

    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="size-9" onClick={toggleFullscreen} aria-label={label}>
                        <Icon className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
