Even I could do it so that means it is not too difficult to set this up, let's get to it right away!

## What to do
*For clarity I want to add the domain name and IP address used below are examples.*  

1. Go to **/etc/dnsmasq.d/** where you installed pi-hole
2. If there is no conf file create a new file, 01-pihole.conf for example
3. Edit or add this: **address=/mydomain.home/192.168.1.10**
4. Save your changes and exit the editor
5. Run the following command: **service pihole-FTL restart**

And that should be it!
