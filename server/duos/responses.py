from django.http import HttpResponseRedirect

class CustomSchemeRedirect(HttpResponseRedirect):
    allowed_schemes = ['http', 'https', 'com.lucive']

    def __init__(self, redirect_to, *args, **kwargs):
        super().__init__(redirect_to, *args, **kwargs)
        self.allowed_schemes += [redirect_to.split(':')[0]]