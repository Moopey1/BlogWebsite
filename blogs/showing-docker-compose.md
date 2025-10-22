## Other technology used

If you want to recreate something like this here is what I used
- Docker and the Docker Compose files below
- Proxmox (LXC, ZFS)
- Pihole for DNS (you can use any DNS server, this is what works for me)
- Traefik (reverse proxy)
- Cloudflare for a domain name and HTTPS

## Sources used

I followed [this Youtube video](https://www.youtube.com/watch?v=-hfejNXqOzA&t=2096s) to set up Traefik/HTTPS for all the services.
To set up the Proxmox container, the ZFS pool and mounts points I followed [this written guide](https://blog.kye.dev/proxmox-series).
This blog inspired me to make this one and I can't lie that I copied some features from their blog to mine!

It's important to know that the yml files below are there for reference only, don't expect them to work instantly.  
This is just how I did it. *It might not be the best/most practical solution, but it works and most importantly I learned a lot from doing it!*  
The guides linked above helped me set them up, if you follow them correctly you should be able to get it to work.

### Important to know
For this to work securely you will need to set up a password and **not** use the insecure option for the Traefik dashboard.   
The files can get you started but should not be used for production.

## How it works

If everything works properly here is how it *should* work.  
For this example we will use radarr.homelab.com

1. In the browser: radarr.homelab.com 
2. Pihole resolves this to the Docker host with a wildcard record (*.homelab.com) 
3. Traefik listens to HTTP and HTTPS traffic and picks up the request, it reads the header, and sees it matches a route you set up.
4. Traefik connected to Let's Encrypt via Cloudflare and created a certificate for the domain.
5. The request gets proxied over the Docker network to Radarr back to your browser.

## .env file

This is how the Youtube tutorial set up the cloudflare token.

```bash
CF_DNS_API_TOKEN=your_cloudflare_token
```
## Docker Compose Media stack

This file defines all my media automation containers such as Radarr, Sonarr, and qBittorrent.  
They’re connected through a shared *frontend* network and routed via Traefik.


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
      - OPENVPN_USER=username
      - OPENVPN_PASSWORD=password
      - SERVER_REGIONS=example
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

## Traefik Compose file

```yml

services:
  traefik:
    image: traefik:v3.5
    container_name: traefik
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    environment:
      - CF_DNS_API_TOKEN=${CF_DNS_API_TOKEN}
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./traefik.yaml:/etc/traefik/traefik.yaml:ro
      - ./certs/:/var/traefik/certs:rw
    networks:
      - frontend
    restart: unless-stopped
networks:
  frontend:
    external: true

```

## Traefik config file

```yml

global:
  checkNewVersion: false
  sendAnonymousUsage: false
log:
  level: DEBUG
api:
  dashboard: true
  insecure: true
entryPoints:
  web:
    address: :80
  websecure:
    address: :443
certificatesResolvers:
  cloudflare:
    acme:
      email: example@email.com  # <-- Change this to your email
      storage: /var/traefik/certs/cloudflare-acme.json
      caServer: "https://acme-v02.api.letsencrypt.org/directory"
      dnsChallenge:
        provider: cloudflare  # <-- (Optional) Change this to your DNS provider
        resolvers:
          - "1.1.1.1:53"
          - "8.8.8.8:53"
providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false

```

