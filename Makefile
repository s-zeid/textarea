all: index.html

.PHONY: optimize deploy


index.html: src/main.html src/main.js
	python3 -c \
	 '1; \
	  import os, re, sys; argv = sys.argv; \
	  files = [open(argv[1], "rb")]; \
	  result = {0: files[0].read()}; \
	  result[0] = b"\n".join([ \
	   l for l in result[0].split(b"\n") if b"___MAKEFILE_DELETE_LINE___" not in l \
	  ]); \
	  result[0] = result[0].replace(b"___VERSION___", argv[-1].encode("utf-8")); \
	  symbol_name = lambda filename: "___%s___" % ( \
	   re.sub(r"[^0-9a-zA-Z_]", "_", os.path.basename(filename).upper()) \
	  ); \
	  pairs = [(i, symbol_name(i).encode("utf-8")) for i in argv[2:-1]]; \
	  [( \
	   print("%s -> %s" % (i[1], i[0]), file=sys.stderr), \
	   files.append(open(i[0], "rb")), \
	   result.update({0: result[0].replace(i[1], files[-1].read())}), \
	  ) for i in pairs]; \
	  [f.close() for f in files]; \
	  sys.stdout.buffer.write(result[0]); sys.stdout.buffer.flush(); \
	 ' \
	 $^ \
	 "(version)" \
	 > "$@"; \
	 r=$$?; [ $$r -ne 0 ] && rm -f "$@" || true


SVGO_ENABLE := removeDoctype,removeXMLProcInst,removeComments,removeMetadata,removeEditorsNSData,cleanupAttrs,inlineStyles,minifyStyles,convertStyleToAttrs,cleanupIDs,removeUselessDefs,cleanupNumericValues,convertColors,removeUnknownsAndDefaults,removeNonInheritableGroupAttrs,removeUselessStrokeAndFill,removeViewBox,cleanupEnableBackground,removeHiddenElems,removeEmptyText,convertShapeToPath,moveElemsAttrsToGroup,moveGroupAttrsToElems,collapseGroups,convertPathData,convertEllipseToCircle,convertTransform,removeEmptyAttrs,removeEmptyContainers,mergePaths,removeUnusedNS,sortAttrs,sortDefsChildren,removeTitle,removeDesc

SVGO_DISABLE := removeXMLNS,removeRasterImages,cleanupListOfValues,reusePaths,removeDimensions,removeStyleElement,removeScriptElement

optimize:
	optipng -strip all -o 7 favicon.png
	svgo --enable=${SVGO_ENABLE} --disable=${SVGO_DISABLE} \
	 --pretty --indent=1 --precision=8 favicon.svg
#	svgo --enable=${SVGO_ENABLE} --disable=${SVGO_DISABLE} \
#	 --precision=3 -o favicon.min.svg favicon.svg


HOST := s.zeid.me
DIR  := ~/srv/www/s.zeid.me/_/textarea

deploy:
	ssh $(HOST) 'cd $(DIR); pwd; git pull && git submodule update && make'
