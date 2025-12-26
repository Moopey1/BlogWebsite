I didn't end up fixing it but still wanted to post something about it, maybe I can help someone with it, who knows!

## TLDR

Cloudflare Universal SSL doesn't include multi-level subdomains. Serving www.blog.tinuslab.nl through the Cloudflare proxy requires a [paid certificate](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/total-tls/error-messages/#active-domains).

A quick work around is disabling proxy on the record (orange cloud to grey).

## My setup
Here's what I am working with
- Linux VPS
- Nginx as reverse proxy
- Domain on/behind Cloudflare

## The problem 
I kept having **ERR_SSL_VERSION_OR_CIPHER_MISMATCH** errors on www.blog.tinuslab.nl with the Cloudflare proxy enabled.  
Even with an A record in Cloudflare DNS settings pointing to the server IP and Nginx configured as seen below.

## Configuration
Nginx reverse proxy and Certbot for HTTPS.

*this is not the whole file*

```bash
server {
        server_name blog.tinuslab.nl www.blog.tinuslab.nl;

        location / {
                proxy_pass http://localhost:1234;
        }
    }

     listen 443 ssl; # managed by Certbot
     # ssl cert config left out 
```

In Cloudflare DNS settings I configured an A record like this.

```bash
Type: A
Name: www.blog
Content: <server-ip>
Proxy status: Proxied
TTL: Auto
```

## Conclusion
If you want your domain to use the Cloudflare proxy you need: 

- Purchase Total TLS or Advanced Certificate or
- Disable the proxy (DNS-only) or
- Don't use multi-level subdomains

In the end I decided to not use www.blog.tinuslab.nl.