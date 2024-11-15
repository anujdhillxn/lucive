from django import forms

class JSONTextForm(forms.Form):
    json_text = forms.CharField(widget=forms.Textarea, label='Paste JSON here')