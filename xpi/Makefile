all: xpi
.PHONY: xpi watch-xpi clean

xpi: textarea
	web-ext build -s "." -o

watch-xpi: textarea
	web-ext build -s "." --as-needed -o

textarea: $(wildcard ../src/*) ../favicon.svg
	mkdir -p $@
	cp -p $^ $@

html: product-page.html
product-page.html: README.md
	pandoc -f markdown-smart -t html5 $< -o $@.tmp
	awk '\
	 BEGIN { hr_seen = 0 }; \
	 /<hr ?\/?>/ { hr_seen = 1; }; \
	 { \
	  if (hr_seen == 2) { print; } \
	  else if (hr_seen == 1) { hr_seen = 2; } \
	 }' $@.tmp > $@
	mv $@ $@.tmp
	sed -i -e 's,<p>,\n,g; s,</p>,,g; s,&quot;,",g' $@.tmp
	sed -i -e 's,<h[1-6][^>]*>,\n<b>,g; s,</h[1-6]>,</b>,g' $@.tmp
	sed -i -e 's,^<\(b\|strong\)>,\n<\1>,g' $@.tmp
	tail -n +2 $@.tmp > $@
	rm -f $@.tmp

clean:
	rm -rf web-ext-artifacts product-page.html
	rm -rf textarea
