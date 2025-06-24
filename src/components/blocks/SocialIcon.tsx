import {
  SiX,
  SiInstagram,
  SiLinkedin,
  SiGithub,
  SiYoutube,
  SiFacebook,
  SiTiktok,
  SiDiscord,
  SiSpotify,
  SiTwitch,
} from 'react-icons/si';

interface SocialIconProps {
  platform: string;
  isAdmin?: boolean;
  isMobile?: boolean;
}

export default function SocialIcon({
  platform,
  isAdmin = false,
  isMobile = false,
}: SocialIconProps) {
  // Use smaller size only for admin mobile view
  const iconSize = isAdmin && isMobile ? 24 : 40;

  const iconProps = {
    size: iconSize,
    className: 'rounded-lg', // Add some rounding to match the design
  };

  switch (platform.toLowerCase()) {
    case 'x':
      return <SiX {...iconProps} color="#000000" />;
    case 'instagram':
      return <SiInstagram {...iconProps} color="#E4405F" />;
    case 'linkedin':
      return <SiLinkedin {...iconProps} color="#0077B5" />;
    case 'github':
      return <SiGithub {...iconProps} color="#181717" />;
    case 'youtube':
      return <SiYoutube {...iconProps} color="#FF0000" />;
    case 'facebook':
      return <SiFacebook {...iconProps} color="#1877F2" />;
    case 'tiktok':
      return <SiTiktok {...iconProps} color="#000000" />;
    case 'discord':
      return <SiDiscord {...iconProps} color="#5865F2" />;
    case 'spotify':
      return <SiSpotify {...iconProps} color="#1DB954" />;
    case 'twitch':
      return <SiTwitch {...iconProps} color="#9146FF" />;
    default:
      // Fallback for unknown platforms - use a generic icon
      return (
        <div
          className="rounded-lg bg-gray-500 flex items-center justify-center text-white font-bold"
          style={{
            width: iconSize,
            height: iconSize,
            fontSize: iconSize * 0.4,
          }}
        >
          {platform.charAt(0).toUpperCase()}
        </div>
      );
  }
}
