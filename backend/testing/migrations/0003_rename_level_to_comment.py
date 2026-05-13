from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('testing', '0002_reading_passage_and_question_link'),
    ]

    operations = [
        migrations.RenameField(
            model_name='test',
            old_name='level',
            new_name='comment',
        ),
        migrations.AlterField(
            model_name='test',
            name='comment',
            field=models.CharField(blank=True, default='', max_length=80),
        ),
    ]
