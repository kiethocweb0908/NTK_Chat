import Lightbox, { type Slide } from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

interface ChatLightboxProps {
  open: boolean;
  close: () => void;
  index: number;
  slides: Slide[];
  //   src: string;
}

const ChatLightbox = ({ open, close, slides, index }: ChatLightboxProps) => {
  return (
    <Lightbox
      open={open}
      close={close}
      index={index}
      slides={slides}
      plugins={[Zoom, Thumbnails]}
      render={{
        buttonPrev: slides.length <= 1 ? () => null : undefined,
        buttonNext: slides.length <= 1 ? () => null : undefined,
      }}
      styles={{ container: { backgroundColor: 'rgba(0, 0, 0, .9)' } }}
      zoom={{ maxZoomPixelRatio: 3 }}
    />
  );
};

export default ChatLightbox;
