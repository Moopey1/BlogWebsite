---
description: "Dit is de omschrijving van de blog."
---

## 

Dit is een test paragraaf.  
Dit ook!

```yml

services:
  gluetun:
    image: qmcgaw/gluetun:latest
    container_name: gluetun
    networks:
      - frontend
    labels:
     - traefik.enable=true
     - traefik.http.routers.qbittorrent-http.rule=Host(`qbittorrent.example.local`)
     - traefik.http.routers.qbittorrent-http.entrypoints=web
     - traefik.http.services.qbittorrent-http.loadbalancer.server.port=9595
     - traefik.http.routers.qbittorrent-https.tls=true
     - traefik.http.routers.qbittorrent-https.tls.certresolver=cloudflare
     - traefik.http.routers.qbittorrent-https.entrypoints=websecure
     - traefik.http.routers.qbittorrent-https.rule=Host(`qbittorrent.example.local`)
    cap_add:
      - NET_ADMIN
    volumes:
      - ./config:/gluetun
    environment:
      - VPN_SERVICE_PROVIDER=private internet access
      - OPENVPN_USER=${OPENVPN_USER}
      - OPENVPN_PASSWORD=${OPENVPN_PASSWORD}
      - SERVER_REGIONS=DK Copenhagen
      - VPN_PORT_FORWARDING=on
      - VPN_PORT_FORWARDING_STATUS_FILE=/gluetun/forwarded_port
    ports:
      - 9595:9595
      - 6881:6881
      - 6881:6881/udp
    restart: unless-stopped

  qbittorrent:
    image: lscr.io/linuxserver/qbittorrent:latest
    container_name: qbittorrent
    network_mode: "service:gluetun"
    restart: unless-stopped
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Europe/Amsterdam
      - WEBUI_PORT=9595
    volumes:
      - /path/to/qbittorrent/config:/config
      - /path/to/media:/data
    depends_on:
      gluetun:
        condition: service_healthy

  radarr:
    image: lscr.io/linuxserver/radarr:latest
    container_name: radarr
    networks:
      - frontend
    labels:
      - traefik.enable=true
      - traefik.http.routers.radarr-http.rule=Host(`radarr.example.local`)
      - traefik.http.routers.radarr-http.entrypoints=web
      - traefik.http.routers.radarr-https.tls=true
      - traefik.http.routers.radarr-https.tls.certresolver=cloudflare
      - traefik.http.routers.radarr-https.entrypoints=websecure
      - traefik.http.routers.radarr-https.rule=Host(`radarr.example.local`)
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Europe/Amsterdam
    volumes:
      - /path/to/radarr/config:/config
      - /path/to/media:/data
    ports:
      - 7878:7878
    restart: unless-stopped
    depends_on:
      qbittorrent:
        condition: service_started

  prowlarr:
    image: lscr.io/linuxserver/prowlarr:latest
    container_name: prowlarr
    networks:
      - frontend
    labels:
      - traefik.enable=true
      - traefik.http.routers.prowlarr-http.rule=Host(`prowlarr.example.local`)
      - traefik.http.routers.prowlarr-http.entrypoints=web
      - traefik.http.routers.prowlarr-https.tls=true
      - traefik.http.routers.prowlarr-https.tls.certresolver=cloudflare
      - traefik.http.routers.prowlarr-https.entrypoints=websecure
      - traefik.http.routers.prowlarr-https.rule=Host(`prowlarr.example.local`)
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Europe/Amsterdam
    volumes:
      - /path/to/prowlarr/config:/config
    ports:
      - 9696:9696
    restart: unless-stopped

  flaresolverr:
    image: ghcr.io/flaresolverr/flaresolverr:latest
    container_name: flaresolverr
    networks:
      - frontend
    labels:
      - traefik.enable=true
      - traefik.http.routers.flaresolverr-http.rule=Host(`flaresolverr.example.local`)
      - traefik.http.routers.flaresolverr-http.entrypoints=web
      - traefik.http.routers.flaresolverr-https.tls=true
      - traefik.http.routers.flaresolverr-https.tls.certresolver=cloudflare
      - traefik.http.routers.flaresolverr-https.entrypoints=websecure
      - traefik.http.routers.flaresolverr-https.rule=Host(`flaresolverr.example.local`)
    environment:
      - LOG_LEVEL=${LOG_LEVEL:-info}
      - LOG_HTML=${LOG_HTML:-false}
      - CAPTCHA_SOLVER=${CAPTCHA_SOLVER:-none}
      - TZ=Europe/Amsterdam
    ports:
      - "${PORT:-8191}:8191"
    restart: unless-stopped

  heimdall:
    image: lscr.io/linuxserver/heimdall:latest
    container_name: heimdall
    networks:
      - frontend
    labels:
      - traefik.enable=true
      - traefik.http.routers.heimdall-http.rule=Host(`heimdall.example.local`)
      - traefik.http.routers.heimdall-http.entrypoints=web
      - traefik.http.routers.heimdall-https.tls=true
      - traefik.http.routers.heimdall-https.tls.certresolver=cloudflare
      - traefik.http.routers.heimdall-https.entrypoints=websecure
      - traefik.http.routers.heimdall-https.rule=Host(`heimdall.example.local`)
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - ALLOW_INTERNAL_REQUESTS=false
    volumes:
      - /path/to/heimdall/config:/config
    restart: unless-stopped

  lidarr:
    image: lscr.io/linuxserver/lidarr:latest
    container_name: lidarr
    networks:
      - frontend
    labels:
      - traefik.enable=true
      - traefik.http.routers.lidarr-http.rule=Host(`lidarr.example.local`)
      - traefik.http.routers.lidarr-http.entrypoints=web
      - traefik.http.routers.lidarr-https.tls=true
      - traefik.http.routers.lidarr-https.tls.certresolver=cloudflare
      - traefik.http.routers.lidarr-https.entrypoints=websecure
      - traefik.http.routers.lidarr-https.rule=Host(`lidarr.example.local`)
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Europe/Amsterdam
    volumes:
      - /path/to/lidarr/config:/config
      - /path/to/media:/data
    ports:
      - 8686:8686
    restart: unless-stopped

  sonarr:
    image: lscr.io/linuxserver/sonarr:latest
    container_name: sonarr
    networks:
      - frontend
    labels:
      - traefik.enable=true
      - traefik.http.routers.sonarr-http.rule=Host(`sonarr.example.local`)
      - traefik.http.routers.sonarr-http.entrypoints=web
      - traefik.http.routers.sonarr-https.tls=true
      - traefik.http.routers.sonarr-https.tls.certresolver=cloudflare
      - traefik.http.routers.sonarr-https.entrypoints=websecure
      - traefik.http.routers.sonarr-https.rule=Host(`sonarr.example.local`)
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Europe/Amsterdam
    volumes:
      - /path/to/sonarr/config:/config
      - /path/to/media:/data
    ports:
      - 8989:8989
    restart: unless-stopped

  bazarr:
    image: lscr.io/linuxserver/bazarr:latest
    container_name: bazarr
    networks:
      - frontend
    labels:
      - traefik.enable=true
      - traefik.http.routers.bazarr-http.rule=Host(`bazarr.example.local`)
      - traefik.http.routers.bazarr-http.entrypoints=web
      - traefik.http.routers.bazarr-https.tls=true
      - traefik.http.routers.bazarr-https.tls.certresolver=cloudflare
      - traefik.http.routers.bazarr-https.entrypoints=websecure
      - traefik.http.routers.bazarr-https.rule=Host(`bazarr.example.local`)
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Europe/Amsterdam
    volumes:
      - /path/to/bazarr/config:/config
    ports:
      - 6767:6767
    restart: unless-stopped

networks:
  frontend:
    external: true


```
