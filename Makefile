.PHONY: optimize


SVGO_ENABLE := removeDoctype,removeXMLProcInst,removeComments,removeMetadata,removeEditorsNSData,cleanupAttrs,inlineStyles,minifyStyles,convertStyleToAttrs,cleanupIDs,removeUselessDefs,cleanupNumericValues,convertColors,removeUnknownsAndDefaults,removeNonInheritableGroupAttrs,removeUselessStrokeAndFill,removeViewBox,cleanupEnableBackground,removeHiddenElems,removeEmptyText,convertShapeToPath,moveElemsAttrsToGroup,moveGroupAttrsToElems,collapseGroups,convertPathData,convertEllipseToCircle,convertTransform,removeEmptyAttrs,removeEmptyContainers,mergePaths,removeUnusedNS,sortAttrs,sortDefsChildren,removeTitle,removeDesc

SVGO_DISABLE := removeXMLNS,removeRasterImages,cleanupListOfValues,reusePaths,removeDimensions,removeStyleElement,removeScriptElement

optimize:
	optipng -strip all -o 7 favicon.png
	svgo --enable=${SVGO_ENABLE} --disable=${SVGO_DISABLE} \
	 --pretty --indent=1 --precision=8 favicon.svg
#	svgo --enable=${SVGO_ENABLE} --disable=${SVGO_DISABLE} \
#	 --precision=3 -o favicon.min.svg favicon.svg
