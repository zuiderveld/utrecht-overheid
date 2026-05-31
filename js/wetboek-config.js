/** URP Wetboek van Strafrecht — Google Doc (centraal bijwerken) */
const URP_WETBOEK = {
    docId: '1qfrcfnsyI-__ufqnPlb56kWgw-W60IqPYoCM7Wxf-Zw',
    get previewUrl() {
        return `https://docs.google.com/document/d/${this.docId}/preview`;
    },
    get editUrl() {
        return `https://docs.google.com/document/d/${this.docId}/edit?usp=sharing`;
    }
};
