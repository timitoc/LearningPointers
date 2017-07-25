#include <string.h>
#include <stdlib.h>
#include <stdio.h>
#include <assert.h>

#include "common.h"

#include "document.h"
#include "html.h"
#include "buffer.h"

#include "hello3.h"

char *parse(char *markdown){

	int mdlen = strlen(markdown);

	printf("Given md length is %d\n", mdlen);

	struct option_data data;
	hoedown_buffer *ib, *ob;
	hoedown_renderer *renderer = NULL;
	void (*renderer_free)(hoedown_renderer *) = NULL;
	hoedown_document *document;

	/* Parse options */
	data.done = 0;
	data.show_time = 0;
	data.iunit = DEF_IUNIT;
	data.ounit = DEF_OUNIT;
	data.filename = NULL;
	data.renderer = RENDERER_HTML;
	data.toc_level = 0;
	data.html_flags = 0;
	data.extensions = 0;
	data.max_nesting = DEF_MAX_NESTING;

	data.extensions = 3;

	ib = hoedown_buffer_new(data.iunit);

	renderer = hoedown_html_renderer_new(data.html_flags, data.toc_level);
	renderer_free = hoedown_html_renderer_free;

	/* Perform Markdown rendering */
	ob = hoedown_buffer_new(data.ounit);
	document = hoedown_document_new(renderer, data.extensions, data.max_nesting);

	// Streams fixing the problem

	FILE* stream1;
	size_t size1;

	char *buff;

	stream1 = open_memstream (&buff, &size1);

	ib->size = mdlen;

	(void)fwrite(markdown, 1, mdlen, stream1);

	fclose(stream1);

	ib->data = (uint8_t*) malloc(mdlen * sizeof(uint8_t));

	memcpy(ib->data, buff, mdlen);

	hoedown_document_render(document, ob, ib->data, ib->size);

	hoedown_buffer_free(ib);
	hoedown_document_free(document);
	renderer_free(renderer);


	char *bp;
	size_t size;
	FILE *stream;

	stream = open_memstream (&bp, &size);

	(void)fwrite(ob->data, 1, ob->size, stream);
	hoedown_buffer_free(ob);

	fclose (stream);

	return bp;
}
