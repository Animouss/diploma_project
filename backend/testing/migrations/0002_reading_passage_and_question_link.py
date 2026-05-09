from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('testing', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ReadingPassage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(blank=True, max_length=255)),
                ('content', models.TextField()),
                ('order', models.PositiveIntegerField(default=1)),
                ('test', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='passages', to='testing.test')),
            ],
            options={'ordering': ['order']},
        ),
        migrations.AddField(
            model_name='question',
            name='passage',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='questions', to='testing.readingpassage'),
        ),
        migrations.AlterField(
            model_name='question',
            name='question_type',
            field=models.CharField(choices=[('single_choice', 'Один вариант'), ('reading_single_choice', 'Чтение + один вариант')], default='single_choice', max_length=40),
        ),
    ]
