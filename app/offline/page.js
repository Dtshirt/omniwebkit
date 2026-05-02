import OfflineContent from './OfflineContent';

export const metadata = {
  title: 'You are Offline - OmniWebKit',
  description: 'It looks like you are offline. Access our client-side tools that work without an internet connection.',
};

export default function OfflinePage() {
  return <OfflineContent />;
}